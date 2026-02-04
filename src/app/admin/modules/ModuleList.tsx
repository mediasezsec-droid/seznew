"use client";

import { useState, useEffect } from "react";
import { deleteModule, deleteModuleLink, addModuleLink, getModuleUsers, searchUsers, grantModuleAccess, revokeModuleAccess } from "@/app/actions/modules";
import { Trash2, Route, Users, Loader2, Plus, X, Link2, Monitor, Edit, UserPlus, Check } from "lucide-react";
import { OrnateCard, GoldenButton } from "@/components/ui/premium-components";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface ModuleLink {
    id: string;
    path: string;
    label: string | null;
}

interface Module {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    links: ModuleLink[];
    _count: { userAccess: number };
}

export function ModuleList({ modules }: { modules: Module[] }) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this module? Users with access will lose it.")) return;
        setDeletingId(id);
        await deleteModule(id);
        setDeletingId(null);
    };

    if (modules.length === 0) {
        return (
            <div className="text-center py-16 text-neutral-400">
                <p className="font-serif text-lg text-neutral-600 mb-1">No modules created yet</p>
                <p className="text-sm">Add your first module using the form above.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {modules.map((module) => (
                <ModuleCard
                    key={module.id}
                    module={module}
                    isDeleting={deletingId === module.id}
                    onDelete={() => handleDelete(module.id)}
                />
            ))}
        </div>
    );
}

function ModuleCard({ module, isDeleting, onDelete }: { module: Module, isDeleting: boolean, onDelete: () => void }) {
    const [addingLinkMode, setAddingLinkMode] = useState(false);
    const [newLink, setNewLink] = useState({ path: "", label: "" });

    const handleAddLink = async () => {
        if (!newLink.path.trim()) return;
        const res = await addModuleLink(module.id, {
            path: newLink.path.trim(),
            label: newLink.label.trim() || undefined,
        });
        if (res.success) {
            setNewLink({ path: "", label: "" });
            setAddingLinkMode(false);
            toast.success("Link Added");
        }
    };

    const handleDeleteLink = async (linkId: string) => {
        await deleteModuleLink(linkId);
        toast.success("Link Removed");
    };

    return (
        <OrnateCard className="flex flex-col h-full bg-white/95 transition-all hover:shadow-2xl border-gold/10 relative group p-0 overflow-hidden">
            {/* Header Section */}
            <div className="p-6 pb-4">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center text-primary-dark shadow-inner border border-gold/10 flex-shrink-0">
                            <Monitor className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-lg text-primary-dark leading-tight line-clamp-1 group-hover:text-gold transition-colors">{module.name}</h3>
                            <p className="text-xs text-neutral-400 font-mono tracking-wide">{module.id}</p>
                        </div>
                    </div>
                    <div className="flex gap-1 -mt-1 -mr-2">
                        <EditModuleDrawer module={module} />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onDelete}
                            disabled={isDeleting}
                            className="text-neutral-300 hover:text-red-500 hover:bg-red-50"
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>

                {module.description && (
                    <p className="text-sm text-neutral-600 mb-6 line-clamp-2 leading-relaxed h-10">{module.description}</p>
                )}
            </div>

            {/* Links Section */}
            <div className="px-6 py-4 bg-neutral-50/50 border-t border-neutral-100 flex-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
                    <span>Quick Links</span>
                    <button onClick={() => setAddingLinkMode(!addingLinkMode)} className="bg-white p-1 rounded-full shadow-sm hover:text-gold hover:shadow transition-all">
                        <Plus className="w-3 h-3" />
                    </button>
                </div>

                <div className="space-y-2">
                    {module.links.map(link => (
                        <LinkItem key={link.id} link={link} onDelete={() => handleDeleteLink(link.id)} />
                    ))}
                    {module.links.length === 0 && !addingLinkMode && (
                        <p className="text-xs text-neutral-400 italic py-2 text-center border border-dashed border-neutral-200 rounded-lg">No links configured</p>
                    )}
                </div>

                {addingLinkMode && (
                    <div className="p-3 bg-white rounded-lg border border-gold/30 shadow-lg space-y-3 mt-3 animate-in fade-in slide-in-from-top-2">
                        <Input
                            placeholder="/path (e.g. /admin/users)"
                            className="h-8 text-xs bg-neutral-50"
                            autoFocus
                            value={newLink.path}
                            onChange={e => setNewLink({ ...newLink, path: e.target.value })}
                        />
                        <Input
                            placeholder="Label (Optional)"
                            className="h-8 text-xs bg-neutral-50"
                            value={newLink.label}
                            onChange={e => setNewLink({ ...newLink, label: e.target.value })}
                        />
                        <div className="flex justify-end gap-2 pt-1">
                            <Button size="sm" variant="ghost" className="h-7 text-xs px-3" onClick={() => setAddingLinkMode(false)}>Cancel</Button>
                            <Button size="sm" className="h-7 text-xs bg-gold text-primary-dark hover:bg-gold-dark px-4 font-bold shadow-md" onClick={handleAddLink}>Add Link</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions Footer */}
            <div className="p-4 border-t border-gold/10 bg-white flex justify-between items-center mt-auto">
                <Badge variant="outline" className="bg-neutral-50 text-neutral-600 border-neutral-200 font-medium px-3 py-1">
                    <Users className="w-3.5 h-3.5 mr-1.5 text-neutral-400" />
                    {module._count.userAccess} {module._count.userAccess === 1 ? 'User' : 'Users'}
                </Badge>

                <ManageAccessDrawer module={module} />
            </div>
        </OrnateCard>
    );
}

function LinkItem({ link, onDelete }: { link: ModuleLink, onDelete: () => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ path: link.path, label: link.label || "" });
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        const { updateModuleLink } = await import("@/app/actions/modules");
        const res = await updateModuleLink(link.id, {
            path: editData.path,
            label: editData.label || undefined
        });
        setIsLoading(false);
        if (res.success) {
            setIsEditing(false);
            toast.success("Link Updated");
        } else {
            toast.error("Failed to update link");
        }
    };

    if (isEditing) {
        return (
            <div className="p-2 bg-white rounded-md border border-gold/30 shadow-sm space-y-2">
                <Input
                    value={editData.path}
                    onChange={e => setEditData({ ...editData, path: e.target.value })}
                    className="h-7 text-xs"
                    placeholder="Path"
                />
                <Input
                    value={editData.label}
                    onChange={e => setEditData({ ...editData, label: e.target.value })}
                    className="h-7 text-xs"
                    placeholder="Label"
                />
                <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setIsEditing(false)}><X className="w-3 h-3" /></Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-green-600" onClick={handleSave}>
                        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-between text-xs p-2 bg-white rounded-md border border-neutral-200 shadow-sm group/link hover:border-gold/30 transition-colors">
            <div className="truncate flex-1 mr-2 text-neutral-700 flex items-center gap-2">
                <Link2 className="w-3 h-3 text-neutral-400" />
                <span className="font-mono text-neutral-600">{link.path}</span>
                {link.label && <span className="ml-1 text-primary-dark font-medium px-1.5 py-0.5 bg-primary/5 rounded text-[10px]">{link.label}</span>}
            </div>
            <div className="flex items-center opacity-0 group-hover/link:opacity-100 transition-opacity">
                <button onClick={() => setIsEditing(true)} className="text-neutral-400 hover:text-blue-500 hover:bg-blue-50 p-1 rounded mr-1">
                    <Edit className="w-3 h-3" />
                </button>
                <button onClick={onDelete} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded">
                    <X className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}

import { ModuleForm } from "./ModuleForm";

function EditModuleDrawer({ module }: { module: Module }) {
    const [open, setOpen] = useState(false);

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" className="text-neutral-300 hover:text-blue-500 hover:bg-blue-50">
                    <Edit className="w-4 h-4" />
                </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[auto] max-h-[85vh] rounded-t-3xl">
                <div className="mx-auto w-full max-w-lg bg-white/60 backdrop-blur-md pb-8">
                    <DrawerHeader className="pb-6 pt-8 border-b border-gray-100 text-left px-6">
                        <DrawerTitle className="text-2xl font-serif font-bold text-primary-dark">Edit Module</DrawerTitle>
                        <DrawerDescription className="text-sm text-gray-500">
                            Update module details and configuration.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="p-6">
                        <ModuleForm
                            initialData={{
                                id: module.id,
                                name: module.name,
                                description: module.description || undefined,
                                icon: module.icon || undefined,
                                links: module.links.map(l => ({ path: l.path, label: l.label || "" }))
                            }}
                            onSuccess={() => setOpen(false)}
                        />
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}


function ManageAccessDrawer({ module }: { module: Module }) {
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);

    useEffect(() => {
        if (open) loadUsers();
    }, [open]);

    useEffect(() => {
        if (search.length > 1) {
            const timer = setTimeout(() => handleSearch(), 300);
            return () => clearTimeout(timer);
        } else {
            setSearchResults([]);
        }
    }, [search]);

    const loadUsers = async () => {
        setLoading(true);
        const res = await getModuleUsers(module.id);
        if (res.success) setUsers(res.data || []);
        setLoading(false);
    };

    const handleSearch = async () => {
        const res = await searchUsers(search);
        if (res.success) setSearchResults(res.data || []);
    };

    const grant = async (userId: string) => {
        const res = await grantModuleAccess(userId, module.id);
        if (res.success) {
            loadUsers();
            setSearch("");
            setSearchResults([]);
        }
    };

    const revoke = async (userId: string) => {
        const res = await revokeModuleAccess(userId, module.id);
        if (res.success) loadUsers();
    };

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button size="sm" className="bg-primary text-white hover:bg-primary-dark shadow-sm">
                    <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Assign Users
                </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[auto] max-h-[85vh] rounded-t-3xl">
                <div className="mx-auto w-full max-w-xl h-full flex flex-col bg-white/60 backdrop-blur-md pb-8">
                    <DrawerHeader className="p-6 pt-8 border-b border-gray-100 bg-white/40 text-left">
                        <DrawerTitle className="text-2xl font-serif font-bold text-primary-dark mb-1">Manage Access</DrawerTitle>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gold/10 flex items-center justify-center text-primary-dark shadow-sm">
                                <Monitor className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 text-sm leading-tight">{module.name}</p>
                                <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wide">{module.id}</p>
                            </div>
                        </div>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Add User */}
                        <div className="space-y-3 relative">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <UserPlus className="w-3 h-3" /> Add User
                            </label>
                            <div className="relative group">
                                <Input
                                    placeholder="Search by name, username or ITS..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="pl-10 h-12 bg-white border-gray-200 focus:border-gold focus:ring-4 focus:ring-gold/10 rounded-xl transition-all shadow-sm group-hover:shadow-md"
                                />
                                <div className="absolute left-3 top-3.5">
                                    <UserPlus className="w-5 h-5 text-gray-400 group-hover:text-gold transition-colors" />
                                </div>
                            </div>
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl max-h-72 overflow-y-auto ring-1 ring-black/5 p-2">
                                    {searchResults.map(u => (
                                        <div
                                            key={u.id}
                                            className="p-3 hover:bg-gold/5 cursor-pointer flex justify-between items-center rounded-lg transition-colors group/item"
                                            onClick={() => grant(u.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 group-hover/item:bg-gold/20 group-hover/item:text-gold-dark transition-colors">
                                                    {u.name?.[0] || u.username?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{u.name || u.username}</p>
                                                    <p className="text-[10px] text-gray-400 font-mono tracking-wide">{u.its}</p>
                                                </div>
                                            </div>
                                            {users.find(existing => existing.id === u.id) ? (
                                                <Badge variant="outline" className="text-[10px] text-green-600 bg-green-50 border-green-200 px-2 py-0.5">Assigned</Badge>
                                            ) : (
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-300 hover:text-gold hover:bg-gold/10 rounded-full">
                                                    <Plus className="w-5 h-5" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                        {/* Current Users */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Access</h4>
                                <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-600 font-bold px-2.5 py-1 rounded-lg border border-gray-200">{users.length} Users</Badge>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4 text-gray-300">
                                    <Loader2 className="w-8 h-8 animate-spin text-gold" />
                                    <span className="text-xs font-medium uppercase tracking-widest">Loading users...</span>
                                </div>
                            ) : users.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 group hover:border-gold/30 transition-colors">
                                    <Users className="w-10 h-10 text-gray-200 mx-auto mb-3 group-hover:text-gold/50 transition-colors" />
                                    <p className="text-sm text-gray-500 font-bold">No users assigned yet</p>
                                    <p className="text-xs text-gray-400 mt-1">Search above to add people to this module</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2">
                                    {users.map(u => (
                                        <div key={u.id} className="flex justify-between items-center p-3 pl-4 rounded-xl border border-transparent bg-white shadow-sm hover:border-gold/30 hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 border border-white shadow-sm flex items-center justify-center text-xs font-bold ring-2 ring-transparent group-hover:ring-gold/10 transition-all">
                                                    {u.name?.[0] || u.username?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{u.name || u.username}</p>
                                                    <p className="text-[10px] text-gray-400 font-mono tracking-wide bg-gray-50 px-1.5 py-0.5 rounded-md inline-block mt-0.5">{u.its}</p>
                                                </div>
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => revoke(u.id)}
                                                className="h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100"
                                                title="Revoke Access"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
