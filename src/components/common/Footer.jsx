function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} MarketPlace. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
