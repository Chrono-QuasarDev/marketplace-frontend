import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/ToastContainer';
import { AuthModal } from './components/AuthModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CreateProductModal } from './components/CreateProductModal';
import { EditProductModal } from './components/EditProductModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { ReviewFormModal } from './components/ReviewFormModal';

import { MarketplaceView } from './views/MarketplaceView';
import { OrdersView } from './views/OrdersView';
import { SellerStudioView } from './views/SellerStudioView';
import { AdminView } from './views/AdminView';
import { ProfileView } from './views/ProfileView';

import { ShoppingBag, Code2 } from 'lucide-react';

function MarketplaceApp() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [currentView, setCurrentView] = useState('marketplace'); // 'marketplace' | 'orders' | 'seller' | 'admin' | 'profile'

  // Modal states
  const [authModalState, setAuthModalState] = useState({ isOpen: false, tab: 'login' });
  const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [selectedEditProduct, setSelectedEditProduct] = useState(null);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Handlers
  const handleOpenAuth = (tab = 'login') => {
    setAuthModalState({ isOpen: true, tab });
  };

  const handleSelectProduct = (product) => {
    setSelectedDetailProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleBuyProduct = (product) => {
    if (!isAuthenticated) {
      toast.warning('Please sign in first to purchase products.');
      handleOpenAuth('login');
      return;
    }
    setSelectedDetailProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleOpenEditProduct = (product) => {
    setSelectedEditProduct(product);
    setIsEditProductModalOpen(true);
  };

  const handleOpenCreateProduct = () => {
    if (!isAuthenticated) {
      toast.warning('Please sign in with a Seller account.');
      handleOpenAuth('login');
      return;
    }
    if (user?.role !== 'seller' && user?.role !== 'admin') {
      toast.warning('Only Seller or Admin accounts can create product listings.');
      return;
    }
    setIsCreateProductModalOpen(true);
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setIsOrderDetailModalOpen(true);
  };

  const handleOpenReview = (product) => {
    if (!isAuthenticated) {
      toast.warning('Please sign in to leave a review.');
      handleOpenAuth('login');
      return;
    }
    setReviewProduct(product);
    setIsReviewModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenAuthModal={handleOpenAuth}
        onOpenCreateProductModal={handleOpenCreateProduct}
      />

      {/* Main View Container */}
      <main className="flex-1 pb-16">
        {currentView === 'marketplace' && (
          <MarketplaceView
            onSelectProduct={handleSelectProduct}
            onBuyProduct={handleBuyProduct}
            onEditProduct={handleOpenEditProduct}
            onOpenCreateModal={handleOpenCreateProduct}
            onOpenAuthModal={handleOpenAuth}
          />
        )}

        {currentView === 'orders' && (
          <OrdersView
            onSelectOrder={handleSelectOrder}
            onOpenReviewModal={handleOpenReview}
            onBrowseMarketplace={() => setCurrentView('marketplace')}
          />
        )}

        {currentView === 'seller' && (
          <SellerStudioView
            onOpenCreateModal={handleOpenCreateProduct}
            onOpenEditModal={handleOpenEditProduct}
            onSelectOrder={handleSelectOrder}
          />
        )}

        {currentView === 'admin' && (
          <AdminView
            onSelectOrder={handleSelectOrder}
            onOpenEditModal={handleOpenEditProduct}
          />
        )}

        {currentView === 'profile' && <ProfileView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-200">Marketplace API Frontend</span>
            <span>•</span>
            <span>Production Client</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentView('profile')}
              className="hover:text-white transition flex items-center gap-1"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>API Diagnostics</span>
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-mono text-[11px]">
              REST / Bearer Auth / Single-Item Architecture
            </span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalState.isOpen}
        defaultTab={authModalState.tab}
        onClose={() => setAuthModalState({ isOpen: false, tab: 'login' })}
      />

      <ProductDetailModal
        isOpen={isDetailModalOpen}
        product={selectedDetailProduct}
        onClose={() => setIsDetailModalOpen(false)}
        onProductUpdated={(updated) => {
          setSelectedDetailProduct(updated);
        }}
        onProductDeleted={() => {
          setSelectedDetailProduct(null);
          setIsDetailModalOpen(false);
        }}
        onOrderCreated={() => {
          setCurrentView('orders');
        }}
        onOpenEditModal={handleOpenEditProduct}
        onOpenReviewModal={handleOpenReview}
      />

      <CreateProductModal
        isOpen={isCreateProductModalOpen}
        onClose={() => setIsCreateProductModalOpen(false)}
        onProductCreated={() => {
          // If in seller studio or marketplace, refresh
        }}
      />

      <EditProductModal
        isOpen={isEditProductModalOpen}
        product={selectedEditProduct}
        onClose={() => {
          setIsEditProductModalOpen(false);
          setSelectedEditProduct(null);
        }}
        onProductUpdated={(updated) => {
          if (selectedDetailProduct?.id === updated.id) {
            setSelectedDetailProduct(updated);
          }
        }}
      />

      <OrderDetailModal
        isOpen={isOrderDetailModalOpen}
        order={selectedOrder}
        onClose={() => {
          setIsOrderDetailModalOpen(false);
          setSelectedOrder(null);
        }}
        onOrderStatusUpdated={(updated) => {
          setSelectedOrder(updated);
        }}
        onOpenReviewModal={handleOpenReview}
      />

      <ReviewFormModal
        isOpen={isReviewModalOpen}
        product={reviewProduct}
        onClose={() => {
          setIsReviewModalOpen(false);
          setReviewProduct(null);
        }}
        onReviewSubmitted={() => {
          // Review submitted
        }}
      />

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MarketplaceApp />
      </AuthProvider>
    </ToastProvider>
  );
}
