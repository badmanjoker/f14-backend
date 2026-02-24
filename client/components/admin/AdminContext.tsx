'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Order {
    _id: string;
    customer: { name: string; email: string };
    totalAmount: number;
    status: string;
    items: any[];
    createdAt: string;
}

interface Product {
    _id: string;
    name: string;
    stock: number;
    image: string;
    slug: string;
    variants: { size: string; color: string; stock: number }[];
}

interface ReturnRequest {
    id: string;
    orderId: string;
    customerName: string;
    productName: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'refunded';
    amount: number;
    date: string;
}

interface AdminContextType {
    isAuthenticated: boolean;
    login: (password: string) => Promise<boolean>;
    logout: () => void;
    orders: Order[];
    inventory: Product[];
    returns: ReturnRequest[];
    stats: { revenue: number; orders: number; aov: number; returnRate: number };
    loading: boolean;
    refreshData: () => void;
    updateReturnStatus: (id: string, status: ReturnRequest['status']) => void;
    updateStock: (productId: string, variantIndex: number, newStock: number) => void;
    markAsShipped: (orderId: string) => Promise<boolean>;
    getAuthHeaders: () => HeadersInit;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [inventory, setInventory] = useState<Product[]>([]);
    const [returns, setReturns] = useState<ReturnRequest[]>([]);

    // Derived Stats
    const stats = {
        revenue: Array.isArray(orders) ? orders.reduce((acc, o) => acc + (o?.status !== 'cancelled' ? (o?.totalAmount || 0) : 0), 0) : 0,
        orders: Array.isArray(orders) ? orders.length : 0,
        aov: (Array.isArray(orders) && orders.length > 0) ? Math.round(orders.reduce((acc, o) => acc + (o?.totalAmount || 0), 0) / orders.length) : 0,
        returnRate: 0,
        pendingOrders: Array.isArray(orders) ? orders.filter(o => o?.status === 'pending').length : 0
    };



    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://f14-backend.onrender.com';

    const login = async (password: string) => {
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            if (res.ok) {
                const data = await res.json();
                sessionStorage.setItem('admin_token', data.token); // CHANGED TO SESSION STORAGE
                setIsAuthenticated(true);
                fetchData(); // Fetch initial data
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Login error', error);
            return false;
        }
    };

    const logout = () => {
        sessionStorage.removeItem('admin_token'); // CHANGED TO SESSION STORAGE
        setIsAuthenticated(false);
        setOrders([]);
        setInventory([]);
    };

    // Auto-login on mount
    useEffect(() => {
        const token = sessionStorage.getItem('admin_token'); // CHANGED TO SESSION STORAGE
        if (token) {
            // Verify token validity? For now, just assume client side validity, API will reject if invalid.
            setIsAuthenticated(true);
            fetchData();
        }
    }, []);

    const getAuthHeaders = (): HeadersInit => {
        const token = sessionStorage.getItem('admin_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const headers = getAuthHeaders();

            // Parallel fetch for Orders and Products (Inventory)
            const [ordersRes, productsRes] = await Promise.all([
                fetch(`${API_URL}/api/orders`, { headers }),
                fetch(`${API_URL}/api/products?t=${Date.now()}`) // Products GET is public
            ]);

            if (ordersRes.status === 401) {
                logout();
                return;
            }

            if (ordersRes.ok) {
                const ordersData = await ordersRes.json();
                setOrders(Array.isArray(ordersData) ? ordersData : []);
            }

            if (productsRes.ok) {
                const productsData = await productsRes.json();
                setInventory(Array.isArray(productsData) ? productsData : []);
            }

            setReturns([]);

        } catch (error) {
            console.error("Admin Data Sync Failed", error);
        } finally {
            setLoading(false);
        }
    };

    const updateReturnStatus = (id: string, status: ReturnRequest['status']) => {
        setReturns(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    };

    const markAsShipped = async (orderId: string) => {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'shipped' as const } : o));

        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: 'shipped' })
            });

            if (res.status === 401) {
                logout();
                throw new Error('Unauthorized');
            }

            if (!res.ok) throw new Error('Failed to update order status');

            console.log(`✅ Order ${orderId} marked as shipped in DB.`);
            return true;
        } catch (error) {
            console.error("Failed to mark as shipped", error);
            fetchData();
            return false;
        }
    };

    const updateStock = async (productId: string, variantIndex: number, newStock: number) => {
        const product = inventory.find(p => p._id === productId);
        if (!product) return;
        const variant = product.variants[variantIndex];
        const oldStock = variant.stock;

        setInventory(prev => prev.map(p => {
            if (p._id === productId) {
                const newVariants = [...p.variants];
                newVariants[variantIndex] = { ...newVariants[variantIndex], stock: newStock };
                return { ...p, variants: newVariants };
            }
            return p;
        }));

        try {
            const res = await fetch(`${API_URL}/api/products/${productId}/stock`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    variantSize: variant.size,
                    adjustment: newStock - oldStock,
                    user: 'admin',
                    reason: 'Admin Manual Update'
                })
            });

            if (res.status === 401) {
                logout();
                throw new Error('Unauthorized');
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to update stock');
            }
        } catch (error: any) {
            console.error("Stock update failed", error);
            alert(`Failed: ${error.message}`);
            fetchData();
        }
    };

    return (
        <AdminContext.Provider value={{ isAuthenticated, login, logout, orders, inventory, stats, returns, loading, refreshData: fetchData, updateReturnStatus, updateStock, markAsShipped, getAuthHeaders }}>
            {children}
        </AdminContext.Provider>
    );
}

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) throw new Error('useAdmin must be used within an AdminProvider');
    return context;
};
