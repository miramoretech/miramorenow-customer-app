import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import {
  Users, ShoppingCart, DollarSign, Bike, TrendingUp, Clock, Package, AlertCircle
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#f59e0b", "#16a34a", "#3b82f6", "#ef4444"];

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [ordersTrend, setOrdersTrend] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'riders' }, () => fetchAll())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAll = async () => {
    const [customersRes, ordersRes, ridersRes, payoutsRes] = await Promise.all([
      supabase.from("customers").select("*"),
      supabase.from("orders").select("*, customers(name), vendors(name), riders(name)"),
      supabase.from("riders").select("*"),
      supabase.from("payouts").select("*").eq("status", "pending"),
    ]);

    const customers = customersRes.data || [];
    const orders = ordersRes.data || [];
    const riders = ridersRes.data || [];
    const pendingPayouts = payoutsRes.data || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(o => new Date(o.created_at) >= today);
    const pendingOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
    const totalRevenue = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + Number(o.total_amount), 0);
    const todayRevenue = todayOrders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + Number(o.total_amount), 0);
    const activeRiders = riders.filter(r => r.is_active).length;
    const pendingPayoutTotal = pendingPayouts.reduce((s, p) => s + Number(p.amount), 0);

    setMetrics({
      totalCustomers: customers.length,
      totalOrders: orders.length,
      ordersToday: todayOrders.length,
      pendingOrders: pendingOrders.length,
      totalRevenue,
      todayRevenue,
      avgOrderValue: orders.length ? Math.round(totalRevenue / orders.length) : 0,
      activeRiders,
      pendingPayouts: pendingPayoutTotal,
    });

    // Recent orders
    setRecentOrders(orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10));

    // Orders trend (last 7 days)
    const trend: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const dayOrders = orders.filter(o => {
        const t = new Date(o.created_at);
        return t >= d && t < next;
      });
      trend.push({
        day: d.toLocaleDateString('en-NG', { weekday: 'short' }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((s, o) => s + Number(o.total_amount), 0),
      });
    }
    setOrdersTrend(trend);

    // Category distribution
    const cats: Record<string, number> = {};
    orders.forEach(o => { cats[o.category] = (cats[o.category] || 0) + 1; });
    setCategoryData(Object.entries(cats).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));

    setLoading(false);
  };

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      out_for_delivery: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return map[s] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  const metricCards = [
    { label: "Total Customers", value: metrics.totalCustomers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Orders", value: metrics.totalOrders, icon: ShoppingCart, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Orders Today", value: metrics.ordersToday, icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Pending Orders", value: metrics.pendingOrders, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Total Revenue", value: `₦${metrics.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "Revenue Today", value: `₦${metrics.todayRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Avg Order Value", value: `₦${metrics.avgOrderValue.toLocaleString()}`, icon: Package, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Active Riders", value: metrics.activeRiders, icon: Bike, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, Admin</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/orders"><Button variant="outline" size="sm">View Orders</Button></Link>
          <Link to="/admin/riders"><Button variant="outline" size="sm">View Riders</Button></Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((m) => (
          <Card key={m.label} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center`}>
                  <m.icon className={`w-5 h-5 ${m.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{m.value}</p>
              <p className="text-xs text-gray-500 mt-1">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Orders & Revenue (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={ordersTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Orders by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
          <Link to="/admin/orders"><Button variant="ghost" size="sm">View All →</Button></Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Order ID</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Customer</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Category</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Total</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Rider</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-2">
                      <Link to={`/admin/orders/${order.id}`} className="text-amber-600 hover:underline font-mono text-xs">
                        {order.id.slice(0, 8)}...
                      </Link>
                    </td>
                    <td className="py-3 px-2">{(order.customers as any)?.name || "N/A"}</td>
                    <td className="py-3 px-2 capitalize">{order.category}</td>
                    <td className="py-3 px-2 font-medium">₦{Number(order.total_amount).toLocaleString()}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(order.status)}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-500">{(order.riders as any)?.name || "Unassigned"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
