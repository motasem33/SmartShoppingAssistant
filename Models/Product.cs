namespace SmartShoppingAssistant.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Category { get; set; } = string.Empty;
        public int StockQuantity { get; set; }
        public string? ImageUrl { get; set; } // ضفنا حقل الصورة هنا
    }
}
   