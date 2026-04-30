import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

const COLORS = ["#f59e0b", "#16a34a", "#3b82f6", "#ef4444", "#8b5cf6"];

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [ordersByCategory, setOrdersByCategory] = useState<any[]>([]);
  const [revenueBreakdown, setRevenueBreakdown] = useState<any[]>([]);
  const [customerGrowth, setCustomerGrowth] = useState<any[]>([]);
  const [topRiders, setTopRiders] = useState<any[]>([]);
  const [topVendors, setTopVendors] = useState<any[]>([]);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    const [ordersRes, ridersRes, vendorsRes, customersRes] = await Promise.all([
      supabase.from("orders").select("*, vendors(name)"),
      supabase.from("riders").select("*").order("total_deliveries", { ascending: false }).limit(5),
      supabase.from("vendors").select("*"),
      supabase.from("customers").select("*"),
    ]);

    const orders = ordersRes.data || [];
    const riders = ridersRes.data || [];
    const vendors = vendorsRes.data || [];
    const customers = customersRes.data || [];

    // Orders by category
    const cats: Record<string, { orders: number; revenue: number }> = {};
    orders.forEach(o => {
      if (!cats[o.category]) cats[o.category] = { orders: 0, revenue: 0 };
      cats[o.category].orders++;
      cats[o.category].revenue += Number(o.total_amount);
    });
    setOrdersByCategory(Object.entries(cats).map(([name, data]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), ...data })));

    // Revenue breakdown
    const totalRevenue = orders.reduce((s, o) => s + Number(o.total_amount), 0);
    const totalDeliveryFees = orders.reduce((s, o) => s + Number(o.delivery_fee), 0);
    const commission = totalRevenue * 0.12;
    setRevenueBreakdown([
      { name: "Product Revenue", value: Math.round(totalRevenue - commission) },
      { name: "Commission", value: Math.round(commission) },
      { name: "Delivery Fees", value: Math.round(totalDeliveryFees) },
    ]);

    // Customer growth (last 7 days)
    const growth: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const count = customers.filter(c => { const t = new Date(c.created_at); return t >= d && t < next; }).length;
      growth.push({ day: d.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric' }), customers: count });
    }
    setCustomerGrowth(growth);

    // Top riders
    setTopRiders(riders.map(r => ({ name: r.name, deliveries: r.total_deliveries, earnings: Number(r.wallet_balance) })));

    // Top vendors by order count
    const vendorOrders: Record<string, number> = {};
    orders.forEach(o => { vendorOrders[o.vendor_id] = (vendorOrders[o.vendor_id] || 0) + 1; });
    const topV = vendors.map(v => ({ name: v.name, orders: vendorOrders[v.id] || 0 })).sort((a, b) => b.orders - a.orders).slice(0, 5);
    setTopVendors(topV);

    setLoading(false);
  };

  const exportCSV = () => {
    // Simple CSV export of orders
    const headers = "Category,Orders,Revenue\n";
    const rows = ordersByCategory.map(c => `${c.name},${c.orders},${c.revenue}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "miramore_analytics.csv"; a.click();
  };

  if (loading) return <div className="space-y-4">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" /> Export CSV</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Orders by Category */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Orders by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ordersByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Revenue Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={revenueBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value"
                  label={({ name, value }) => `${name}: ₦${value.toLocaleString()}`}>
                  {revenueBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Growth */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">New Customers (7 Days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={customerGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="customers" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Riders */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Top Riders</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topRiders} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                <Tooltip />
                <Bar dataKey="deliveries" fill="#16a34a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Vendors */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Top Vendors by Orders</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topVendors}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
