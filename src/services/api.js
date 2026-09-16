/**
 * Marketplace API Client
 * Implements full REST integration according to Marketplace API specifications
 */

const STORAGE_KEY_TOKEN = 'marketplace_jwt_token';
const STORAGE_KEY_API_URL = '/api/v1';

export const getStoredApiUrl = () => {
  return localStorage.getItem(STORAGE_KEY_API_URL) || '/api/v1';
};

export const setStoredApiUrl = (url) => {
  if (!url) {
    localStorage.removeItem(STORAGE_KEY_API_URL);
  } else {
    // Normalize url to avoid trailing slashes
    const normalized = url.trim().replace(/\/+$/, '');
    localStorage.setItem(STORAGE_KEY_API_URL, normalized);
  }
};

export const getStoredToken = () => {
  return localStorage.getItem(STORAGE_KEY_TOKEN) || '';
};

export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  }
};

/**
 * Universal request helper that parses JSON and handles API errors
 */
async function request(endpoint, options = {}) {
  const baseUrl = getStoredApiUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (netErr) {
    throw new Error(`Network error: Unable to connect to backend at ${url}. ${netErr.message}`);
  }

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const errorMessage =
      (data && (data.error || data.message)) ||
      `Request failed with status ${response.status} (${response.statusText})`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ---------------- AUTH API ----------------

export const authApi = {
  /**
    * POST /api/auth/signup
    * Request: { username, email, password }
    * Response: { user: { id, username, email, role } }
    */
  signup: async ({ username, email, password }) => {
    return await request('/auth/signup', {
      method: 'POST',
      body: { username, email, password },
    });
  },

  /**
    * POST /api/auth/login
    * Request: { email, password }
    * Response: { user: { id, username, email, role }, token }
    */
  login: async ({ email, password }) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (res && res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  logout: () => {
    setStoredToken(null);
  },
};

// ---------------- USERS API ----------------

export const usersApi = {
  /**
    * GET /api/users/profile
    * Response: { id, username, email, role }
    */
  getProfile: async () => {
    return await request('/users/profile', {
      method: 'GET',
    });
  },

  /**
    * GET /api/users
    * Response: { users: [{ id, username, email, role }] }
    */
  getUsers: async () => {
     return await request('/users', {
       method: 'GET',
     });
  },

  /**
    * PATCH /api/users/:id/role
    * Request: { role }
    * Response: { user: { id, username, email, role } }
    */
  updateUserRole: async (userId, role) => {
     return await request(`/users/${userId}/role`, {
       method: 'PATCH',
       body: { role },
     });
  },

  /**
    * PUT /api/users/profile
    * Request: { username }
    * Response: { user: { id, username, email, role } }
    */
  updateProfile: async ({ username }) => {
     return await request('/users/profile', {
       method: 'PUT',
       body: { username },
     });
  },
};

// ---------------- PRODUCTS API ----------------

export const productsApi = {
  /**
    * GET /api/products
    * Query params: page, size, sortBy (createdAt|price|title), orderBy (asc|desc)
    * Response: { data: Product[], meta: { page, limit, totalItems, totalPages } }
    */
  getProducts: async ({ page = 1, size = 12, sortBy = 'createdAt', orderBy = 'desc' } = {}) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (size) params.append('size', size.toString());
    if (sortBy) params.append('sortBy', sortBy);
    if (orderBy) params.append('orderBy', orderBy);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await request(`/products${queryString}`, {
      method: 'GET',
    });
  },

  /**
    * GET /api/products/:id
    * Response: Product object
    */
  getProductById: async (id) => {
    return await request(`/products/${id}`, {
      method: 'GET',
    });
  },

  /**
    * POST /api/products (Allowed role: seller)
    * Request: { title, description, price, category, images, availability }
    * Response: Product object
    */
  createProduct: async ({ title, description, price, category, images, availability = true }) => {
    return await request('/products', {
      method: 'POST',
      body: {
        title,
        description,
        price: typeof price === 'number' ? price : parseFloat(price),
        category,
        images: Array.isArray(images) ? images : [images],
        availability: Boolean(availability),
      },
    });
  },

  /**
    * PUT /api/products/:id (Allowed role: seller / owner)
    * Request: partial subset of { title, description, price, category, images, availability }
    * Response: Product object
    */
  updateProduct: async (id, productData) => {
    const payload = {};
    if (productData.title !== undefined) payload.title = productData.title;
    if (productData.description !== undefined) payload.description = productData.description;
    if (productData.price !== undefined) {
      payload.price = typeof productData.price === 'number' ? productData.price : parseFloat(productData.price);
    }
    if (productData.category !== undefined) payload.category = productData.category;
    if (productData.images !== undefined) {
      payload.images = Array.isArray(productData.images) ? productData.images : [productData.images];
    }
    if (productData.availability !== undefined) payload.availability = Boolean(productData.availability);

    return await request(`/products/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },

  /**
    * DELETE /api/products/:id (Allowed role: seller / owner)
    * Response: { message: "Product deleted successfully" }
    */
  deleteProduct: async (id) => {
    return await request(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// ---------------- ORDERS API ----------------

export const ordersApi = {
  /**
    * POST /api/orders/purchase (Allowed role: buyer)
    * Request: { productId }
    * Response: { order: { id, buyerId, productId, priceAtPurchase, status, createdAt, updatedAt } }
    */
  purchase: async (productId) => {
    return await request('/orders/purchase', {
      method: 'POST',
      body: { productId },
    });
  },

  /**
    * GET /api/orders
    * Response: { orders: Order[] } (each order contains nested Product object)
    */
  getOrders: async () => {
    return await request('/orders', {
      method: 'GET',
    });
  },

  /**
    * GET /api/orders/:id
    * Response: { order: Order }
    */
  getOrderById: async (id) => {
    return await request(`/orders/${id}`, {
      method: 'GET',
    });
  },

  /**
    * PATCH /api/orders/:id (Allowed role: seller, admin)
    * Request: { status: 'pending'|'processing'|'shipped'|'delivered'|'cancelled' }
    * Response: { order: Order }
    */
  updateOrderStatus: async (id, status) => {
    return await request(`/orders/${id}`, {
      method: 'PATCH',
      body: { status },
    });
  },
};

// ---------------- REVIEWS API ----------------

export const reviewsApi = {
  /**
    * GET /api/reviews/:productId (takes productId in URL!)
    * Query params (optional): rating, sortBy (createdAt|rating), orderBy (asc|desc), page, size
    * Response:
    *   - Without query params: Array of Review objects
    *   - With query params: { data: Review[], meta: { page, limit, totalItems, totalPages } }
    */
  getProductReviews: async (productId, { rating, sortBy, orderBy, page, size } = {}) => {
    const params = new URLSearchParams();
    if (rating !== undefined && rating !== null && rating !== '') params.append('rating', rating.toString());
    if (sortBy) params.append('sortBy', sortBy);
    if (orderBy) params.append('orderBy', orderBy);
    if (page) params.append('page', page.toString());
    if (size) params.append('size', size.toString());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await request(`/reviews/${productId}${queryString}`, {
      method: 'GET',
    });
  },

  /**
    * POST /api/reviews (Allowed role: buyer who purchased product & order is delivered)
    * Request: { productId, rating, comment }
    * Response: Review object (201)
    */
  createReview: async ({ productId, rating, comment }) => {
    return await request('/reviews', {
      method: 'POST',
      body: {
        productId,
        rating: Number(rating),
        comment: comment || '',
      },
    });
  },

  /**
    * PUT /api/reviews/:id (takes reviewId in URL, allowed: review owner)
    * Request: { rating, comment }
    * Response: Review object
    */
  updateReview: async (reviewId, { rating, comment }) => {
    const payload = {};
    if (rating !== undefined) payload.rating = Number(rating);
    if (comment !== undefined) payload.comment = comment;

    return await request(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: payload,
    });
  },

  /**
    * DELETE /api/reviews/:id (takes reviewId in URL, allowed: buyer owner or admin)
    * Response: { message: "Review deleted successfully" }
    */
  deleteReview: async (reviewId) => {
    return await request(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  },
};
