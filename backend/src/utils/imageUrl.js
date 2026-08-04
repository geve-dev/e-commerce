function publicImageUrl(image) {
  if (!image) return image;
  if (/^https?:\/\//i.test(image)) return image;
  if (image.startsWith('/uploads/')) {
    return `http://localhost:${process.env.PORT || 3003}${image}`;
  }
  // caminhos absolutos antigos (Windows/Linux) → URL pública
  const match = String(image).match(/[\\/]uploads[\\/]products[\\/]([^\\/]+)$/i);
  if (match) {
    return `http://localhost:${process.env.PORT || 3003}/uploads/products/${match[1]}`;
  }
  return image;
}

function withPublicImage(product) {
  if (!product) return product;
  if (Array.isArray(product)) {
    return product.map(withPublicImage);
  }
  return { ...product, image: publicImageUrl(product.image) };
}

module.exports = { publicImageUrl, withPublicImage };
