import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

const AdminVendors = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", category: "food" as "food" | "fashion", phone: "", email: "", address: "", commission_rate: "12" });

  useEffect(() => { fetchVendors(); }, []);

  const fetchVendors = async () => {
    const { data } = await supabase.from("vendors").select("*").order("created_at", { ascending: false });
    setVendors(data || []);
    setLoading(false);
  };

  const openNew = () => { setEditing(null); setForm({ name: "", category: "food", phone: "", email: "", address: "", commission_rate: "12" }); setShowModal(true); };
  const openEdit = (v: any) => { setEditing(v); setForm({ name: v.name, category: v.category === "fashion" ? "fashion" : "food", phone: v.phone || "", email: v.email || "", address: v.address || "", commission_rate: String(v.commission_rate) }); setShowModal(true); };

  const save = async () => {
    const payload = { ...form, commission_rate: Number(form.commission_rate) };
    if (editing) {
      await supabase.from("vendors").update(payload).eq("id", editing.id);
      toast.success("Vendor updated");
    } else {
      await supabase.from("vendors").insert(payload);
      toast.success("Vendor added");
    }
    setShowModal(false);
    fetchVendors();
  };

  const toggleActive = async (v: any) => {
    await supabase.from("vendors").update({ is_active: !v.is_active }).eq("id", v.id);
    fetchVendors();
  };

  const deleteVendor = async (id: string, name: string) => {
    if (!confirm(`Delete vendor "${name}"? This cannot be undone.`)) return;
    await supabase.from("vendors").delete().eq("id", id);
    toast.success("Vendor deleted");
    fetchVendors();
  };

  const filtered = vendors.filter(v => !search || v.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="space-y-4">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
        <Button size="sm" onClick={openNew} className="bg-amber-500 hover:bg-amber-600"><Plus className="w-4 h-4 mr-1" /> Add Vendor</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Category</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Phone</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Commission</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-medium">{v.name}</td>
                    <td className="py-3 px-4 capitalize">{v.category === "fashion" ? "Beauty" : v.category === "food" ? "Food" : v.category}</td>
                    <td className="py-3 px-4 text-gray-500">{v.phone}</td>
                    <td className="py-3 px-4">{v.commission_rate}%</td>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleActive(v)} className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${v.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {v.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(v)}><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteVendor(v.id, v.name)} className="text-red-500 hover:text-red-700"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Vendor" : "Add Vendor"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="Vendor Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as "food" | "fashion" })} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="food">Food</option>
              <option value="fashion">Beauty</option>
            </select>
            <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <Input placeholder="Commission %" type="number" value={form.commission_rate} onChange={(e) => setForm({ ...form, commission_rate: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={save} className="bg-amber-500 hover:bg-amber-600">{editing ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVendors;
