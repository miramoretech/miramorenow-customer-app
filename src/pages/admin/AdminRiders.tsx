import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

const AdminRiders = () => {
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", vehicle_type: "Motorcycle", license_plate: "" });

  useEffect(() => {
    fetchRiders();
    const channel = supabase
      .channel("admin-riders")
      .on("postgres_changes", { event: "*", schema: "public", table: "riders" }, () => fetchRiders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchRiders = async () => {
    const { data } = await supabase.from("riders").select("*").order("created_at", { ascending: false });
    setRiders(data || []);
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", email: "", password: "", phone: "", vehicle_type: "Motorcycle", license_plate: "" });
    setShowModal(true);
  };

  const openEdit = (r: any) => {
    setEditing(r);
    setForm({ name: r.name, email: r.email || "", password: "", phone: r.phone || "", vehicle_type: r.vehicle_type || "Motorcycle", license_plate: r.license_plate || "" });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.name || !form.email) { toast.error("Name and email required"); return; }
    if (editing) {
      const payload: any = { name: form.name, email: form.email, phone: form.phone, vehicle_type: form.vehicle_type, license_plate: form.license_plate };
      if (form.password) payload.password = form.password;
      await supabase.from("riders").update(payload).eq("id", editing.id);
      toast.success("Rider updated");
    } else {
      if (!form.password) { toast.error("Password required for new rider"); return; }
      await supabase.from("riders").insert({ ...form });
      toast.success("Rider added");
    }
    setShowModal(false);
    fetchRiders();
  };

  const deleteRider = async (id: string, name: string) => {
    if (!confirm(`Delete rider "${name}"? This cannot be undone.`)) return;
    await supabase.from("riders").delete().eq("id", id);
    toast.success("Rider deleted");
    fetchRiders();
  };

  const toggleActive = async (r: any) => {
    await supabase.from("riders").update({ is_active: !r.is_active }).eq("id", r.id);
    fetchRiders();
  };

  const filtered = riders.filter(r => {
    if (!search) return true;
    return r.name.toLowerCase().includes(search.toLowerCase()) || r.phone?.includes(search) || r.email?.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return <div className="space-y-4">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Riders</h1>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-500">{riders.length} total</span>
          <Button size="sm" onClick={openNew} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-1" /> Add Rider
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search riders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Phone</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Vehicle</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Deliveries</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Wallet</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Online</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((rider) => (
                  <tr key={rider.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-medium">{rider.name}</td>
                    <td className="py-3 px-4 text-gray-500">{rider.email}</td>
                    <td className="py-3 px-4 text-gray-500">{rider.phone}</td>
                    <td className="py-3 px-4">{rider.vehicle_type}</td>
                    <td className="py-3 px-4">{rider.total_deliveries}</td>
                    <td className="py-3 px-4 font-medium text-green-700">₦{Number(rider.wallet_balance).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleActive(rider)} className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${rider.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {rider.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`w-2 h-2 rounded-full inline-block ${rider.is_online ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <Link to={`/admin/riders/${rider.id}`}><Button variant="ghost" size="sm">View</Button></Link>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(rider)}><Edit2 className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteRider(rider.id, rider.name)} className="text-red-500 hover:text-red-700"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={9} className="py-8 text-center text-gray-400">No riders found</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Rider" : "Add Rider"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder={editing ? "New Password (leave blank to keep)" : "Password"} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <select value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="Motorcycle">Motorcycle</option>
              <option value="Bicycle">Bicycle</option>
              <option value="Car">Car</option>
              <option value="Van">Van</option>
            </select>
            <Input placeholder="License Plate" value={form.license_plate} onChange={(e) => setForm({ ...form, license_plate: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={save} className="bg-green-600 hover:bg-green-700">{editing ? "Update" : "Add Rider"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRiders;
