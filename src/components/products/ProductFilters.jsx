import { useSearchParams } from 'react-router-dom';
import { CATEGORIES, SORT_OPTIONS } from '../../utils/constants';

function ProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const update = (key, value) => {
    const next = { ...Object.fromEntries(searchParams) };
    if (value) next[key] = value;
    else delete next[key];
    next.page = '1';
    setSearchParams(next);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-col md:flex-row gap-4">
      <input
        type="search"
        placeholder="Search products..."
        defaultValue={searchParams.get('search') || ''}
        onChange={(e) => update('search', e.target.value)}
        className="input-field md:flex-1"
      />
      <select
        value={searchParams.get('category') || ''}
        onChange={(e) => update('category', e.target.value)}
        className="input-field md:w-48"
      >
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        value={searchParams.get('sortBy') || 'createdAt'}
        onChange={(e) => update('sortBy', e.target.value)}
        className="input-field md:w-40"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <select
        value={searchParams.get('orderBy') || 'desc'}
        onChange={(e) => update('orderBy', e.target.value)}
        className="input-field md:w-36"
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
    </div>
  );
}

export default ProductFilters;
