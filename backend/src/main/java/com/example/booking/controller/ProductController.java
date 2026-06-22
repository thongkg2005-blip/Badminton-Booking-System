package com.example.booking.controller;

import com.example.booking.model.Product;
import com.example.booking.model.ProductCategory;
import com.example.booking.model.Branch;
import com.example.booking.repository.ProductCategoryRepository;
import com.example.booking.repository.ProductRepository;
import com.example.booking.repository.BranchRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;
    private final BranchRepository branchRepository;

    public ProductController(ProductRepository productRepository,
                             ProductCategoryRepository categoryRepository,
                             BranchRepository branchRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.branchRepository = branchRepository;
    }

    /** GET /api/products — list all products (optional ?category=name filter) */
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(required = false) String category) {
        List<Product> products = (category != null && !category.isBlank())
                ? productRepository.findByCategory_Name(category)
                : productRepository.findAll();
        return ResponseEntity.ok(products);
    }

    /** GET /api/products/{id} — get a single product */
    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        return ResponseEntity.ok(product);
    }

    /** GET /api/product-categories — list all categories */
    @GetMapping("/product-categories")
    public ResponseEntity<List<ProductCategory>> getCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    /** POST /api/products — create a new product (admin) */
    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@RequestBody ProductRequest req) {
        ProductCategory category = categoryRepository.findById(req.categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found"));

        Product product = new Product();
        product.setName(req.name);
        product.setBrand(req.brand);
        product.setPrice(req.price);
        product.setDiscount(req.discount != null ? req.discount : 0);
        product.setImage(req.image != null ? req.image : "🏸");
        product.setRating(req.rating);
        product.setStock(req.stock != null ? req.stock : 0);
        product.setDescription(req.description);
        product.setCategory(category);
        product.setBranch(resolveBranch(req.branchId));

        return ResponseEntity.status(HttpStatus.CREATED).body(productRepository.save(product));
    }

    /** PUT /api/products/{id} — update a product (admin) */
    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id,
                                                 @RequestBody ProductRequest req) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (req.name != null)        product.setName(req.name);
        if (req.brand != null)       product.setBrand(req.brand);
        if (req.price != null)       product.setPrice(req.price);
        if (req.discount != null)    product.setDiscount(req.discount);
        if (req.image != null)       product.setImage(req.image);
        if (req.rating != null)      product.setRating(req.rating);
        if (req.stock != null)       product.setStock(req.stock);
        if (req.description != null) product.setDescription(req.description);
        if (req.categoryId != null) {
            ProductCategory cat = categoryRepository.findById(req.categoryId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found"));
            product.setCategory(cat);
        }
        if (req.branchId != null) {
            product.setBranch(resolveBranch(req.branchId));
        }

        return ResponseEntity.ok(productRepository.save(product));
    }

    /** DELETE /api/products/{id} — delete a product (admin) */
    @DeleteMapping("/products/{id}")
    public ResponseEntity<Map<String, Object>> deleteProduct(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        productRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("deleted", true, "id", id));
    }

    /** DTO for create/update requests */
    public static class ProductRequest {
        public String name;
        public String brand;
        public java.math.BigDecimal price;
        public Integer discount;
        public String image;
        public java.math.BigDecimal rating;
        public Integer stock;
        public String description;
        public Long categoryId;
        public Long branchId;
    }

    private Branch resolveBranch(Long branchId) {
        if (branchId != null) {
            return branchRepository.findById(branchId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Branch not found"));
        }
        return branchRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No branch configured"));
    }
}
