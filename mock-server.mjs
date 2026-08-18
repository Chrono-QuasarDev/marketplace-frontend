import http from 'http';

const products = [
  {
    id: '1',
    title: 'Wireless Headphones',
    description: 'Comfortable over-ear headphones with 30-hour battery life.',
    price: 89.99,
    category: 'electronics',
    images: ['https://placehold.co/800x500/2563eb/ffffff?text=Headphones'],
    availability: true,
    sellerId: 's1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Vintage Denim Jacket',
    description: 'Classic fit jacket in washed indigo. Great everyday layer.',
    price: 54.0,
    category: 'fashion',
    images: ['https://placehold.co/800x500/1e40af/ffffff?text=Jacket'],
    availability: true,
    sellerId: 's1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'City Commuter Bike',
    description: 'Lightweight frame, 7-speed, perfect for urban rides.',
    price: 320,
    category: 'vehicles',
    images: ['https://placehold.co/800x500/0f172a/ffffff?text=Bike'],
    availability: true,
    sellerId: 's2',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Cookbook Collection',
    description: 'Three-volume set covering West African and global recipes.',
    price: 28.5,
    category: 'books',
    images: ['https://placehold.co/800x500/64748b/ffffff?text=Books'],
    availability: true,
    sellerId: 's2',
    createdAt: new Date().toISOString(),
  },
];

const users = [
  { id: 'u1', username: 'buyer1', email: 'buyer@example.com', password: 'password', role: 'buyer' },
  { id: 's1', username: 'seller1', email: 'seller@example.com', password: 'password', role: 'seller' },
  { id: 'a1', username: 'admin', email: 'admin@example.com', password: 'password', role: 'admin' },
];

const orders = [];
const reviews = [];
const tokens = new Map();

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(body));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function authUser(req) {
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '');
  return tokens.get(token) || null;
}

function toPublicUser(user) {
  return user ? { id: user.id, username: user.username, email: user.email, role: user.role } : null;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    });
    return res.end();
  }

  const url = new URL(req.url, 'http://localhost');
  const { pathname, searchParams } = url;

  if (req.method === 'POST' && pathname === '/api/auth/signup') {
    const body = await parseBody(req);
    if (users.some((u) => u.email === body.email)) return send(res, 409, { error: 'Email already exists' });
    const user = { id: `u${Date.now()}`, role: 'buyer', ...body };
    users.push(user);
    return send(res, 201, { user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  }

  if (req.method === 'POST' && pathname === '/api/auth/login') {
    const body = await parseBody(req);
    const user = users.find((u) => u.email === body.email && u.password === body.password);
    if (!user) return send(res, 401, { error: 'Invalid credentials' });
    const token = `tok_${user.id}_${Date.now()}`;
    tokens.set(token, user);
    return send(res, 200, {
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  }

  if (req.method === 'GET' && pathname === '/api/users/profile') {
    const user = authUser(req);
    if (!user) return send(res, 401, { error: 'Unauthorized' });
    return send(res, 200, toPublicUser(user));
  }

  if (req.method === 'GET' && pathname === '/api/users') {
    const user = authUser(req);
    if (!user) return send(res, 401, { error: 'Unauthorized' });
    if (user.role !== 'admin') return send(res, 403, { error: 'Forbidden' });
    return send(res, 200, { users: users.map((u) => toPublicUser(u)) });
  }

  const userMatch = pathname.match(/^\/api\/users\/([^/]+)\/role$/);
  if (userMatch && req.method === 'PATCH') {
    const actor = authUser(req);
    if (!actor) return send(res, 401, { error: 'Unauthorized' });
    if (actor.role !== 'admin') return send(res, 403, { error: 'Forbidden' });

    const targetUser = users.find((u) => u.id === userMatch[1]);
    if (!targetUser) return send(res, 404, { error: 'User not found' });

    const body = await parseBody(req);
    const nextRole = body.role;
    if (!['buyer', 'seller', 'admin'].includes(nextRole)) {
      return send(res, 400, { error: 'Role must be buyer, seller, or admin' });
    }

    targetUser.role = nextRole;
    return send(res, 200, { user: toPublicUser(targetUser) });
  }

  if (req.method === 'PUT' && pathname === '/api/users/profile') {
    const user = authUser(req);
    if (!user) return send(res, 401, { error: 'Unauthorized' });
    const body = await parseBody(req);
    user.username = body.username || user.username;
    return send(res, 200, { user: toPublicUser(user) });
  }

  if (req.method === 'GET' && pathname === '/api/products') {
    let list = [...products];
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const orderBy = searchParams.get('orderBy') || 'desc';
    const page = Number(searchParams.get('page') || 1);
    const size = Number(searchParams.get('size') || 10);
    if (category) list = list.filter((p) => p.category === category);
    if (search) list = list.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
    list.sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      if (av < bv) return orderBy === 'asc' ? -1 : 1;
      if (av > bv) return orderBy === 'asc' ? 1 : -1;
      return 0;
    });
    const totalItems = list.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / size));
    const data = list.slice((page - 1) * size, page * size);
    return send(res, 200, { data, meta: { page, size, totalItems, totalPages } });
  }

  const productMatch = pathname.match(/^\/api\/products\/([^/]+)$/);
  if (productMatch && req.method === 'GET') {
    const product = products.find((p) => p.id === productMatch[1]);
    if (!product) return send(res, 404, { error: 'Not found' });
    return send(res, 200, product);
  }

  if (req.method === 'POST' && pathname === '/api/products') {
    const user = authUser(req);
    if (!user) return send(res, 401, { error: 'Unauthorized' });
    const body = await parseBody(req);
    const product = { id: String(Date.now()), sellerId: user.id, availability: true, createdAt: new Date().toISOString(), ...body };
    products.unshift(product);
    return send(res, 201, product);
  }

  if (productMatch && req.method === 'PUT') {
    const user = authUser(req);
    if (!user) return send(res, 401, { error: 'Unauthorized' });
    const idx = products.findIndex((p) => p.id === productMatch[1]);
    if (idx < 0) return send(res, 404, { error: 'Not found' });
    const body = await parseBody(req);
    products[idx] = { ...products[idx], ...body };
    return send(res, 200, products[idx]);
  }

  if (productMatch && req.method === 'DELETE') {
    const user = authUser(req);
    if (!user) return send(res, 401, { error: 'Unauthorized' });
    const idx = products.findIndex((p) => p.id === productMatch[1]);
    if (idx < 0) return send(res, 404, { error: 'Not found' });
    products.splice(idx, 1);
    return send(res, 200, { success: true });
  }

  if (req.method === 'POST' && pathname === '/api/orders/purchase') {
    const user = authUser(req);
    if (!user) return send(res, 401, { error: 'Unauthorized' });
    const body = await parseBody(req);
    const product = products.find((p) => p.id === body.productId);
    if (!product) return send(res, 404, { error: 'Product not found' });
    const order = {
      id: String(Date.now()),
      product,
      productId: product.id,
      status: 'pending',
      total: product.price,
      createdAt: new Date().toISOString(),
      buyerId: user.id,
    };
    orders.unshift(order);
    return send(res, 201, { order });
  }

  if (req.method === 'GET' && pathname === '/api/orders') {
    const user = authUser(req);
    if (!user) return send(res, 401, { error: 'Unauthorized' });
    return send(res, 200, { orders });
  }

  const orderMatch = pathname.match(/^\/api\/orders\/([^/]+)$/);
  if (orderMatch && req.method === 'GET') {
    const user = authUser(req);
    if (!user) return send(res, 401, { error: 'Unauthorized' });
    const order = orders.find((o) => o.id === orderMatch[1]);
    if (!order) return send(res, 404, { error: 'Not found' });
    return send(res, 200, { order });
  }

  if (orderMatch && req.method === 'PATCH') {
    const user = authUser(req);
    if (!user) return send(res, 401, { error: 'Unauthorized' });
    const order = orders.find((o) => o.id === orderMatch[1]);
    if (!order) return send(res, 404, { error: 'Not found' });
    const body = await parseBody(req);
    order.status = body.status;
    return send(res, 200, { order });
  }

  if (req.method === 'POST' && pathname === '/api/reviews') {
    const user = authUser(req);
    if (!user) return send(res, 401, { error: 'Unauthorized' });
    const body = await parseBody(req);
    const review = {
      id: String(Date.now()),
      ...body,
      user: { username: user.username },
      createdAt: new Date().toISOString(),
    };
    reviews.unshift(review);
    return send(res, 201, review);
  }

  const reviewMatch = pathname.match(/^\/api\/reviews\/([^/]+)$/);
  if (reviewMatch && req.method === 'GET') {
    return send(res, 200, { reviews: reviews.filter((r) => r.productId === reviewMatch[1]) });
  }

  send(res, 404, { error: 'Not found' });
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Mock API on http://localhost:3000');
});
