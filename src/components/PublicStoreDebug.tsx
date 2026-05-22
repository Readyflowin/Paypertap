import { usePublicStore } from "../hooks/usePublicStore";

export default function PublicStoreDebug() {
  const { data, loading, error } = usePublicStore("aditya-store");

  if (loading) {
    return <div style={{ padding: 24 }}>Loading store...</div>;
  }

  if (error) {
    return <div style={{ padding: 24, color: "red" }}>{error}</div>;
  }

  if (!data) {
    return <div style={{ padding: 24 }}>No store data found.</div>;
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h2>Public Store Debug</h2>

      <h3>Store</h3>
      <p>
        <strong>Name:</strong> {data.store.storeName}
      </p>
      <p>
        <strong>Bio:</strong> {data.store.bio}
      </p>
      <p>
        <strong>Theme:</strong> {data.store.themeId}
      </p>

      <h3>Theme</h3>
      <p>
        <strong>Name:</strong> {data.theme?.themeName ?? "No theme found"}
      </p>
      <p>
        <strong>Accent:</strong>{" "}
        {data.theme?.defaultColors.accentColor ?? "N/A"}
      </p>

      <h3>Products</h3>
      {data.products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul>
          {data.products.map((product) => (
            <li key={product.id}>
              {product.title} - Rs. {product.price} - Advance Rs.{" "}
              {product.bookingAdvanceAmount || 20}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
