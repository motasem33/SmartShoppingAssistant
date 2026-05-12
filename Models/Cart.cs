namespace SmartShoppingAssistant.Models
{
    public class Cart
    {
        public int Id { get; set; }
        // معرف المستخدم (نأخذه من نظام Identity الذي أنشأناه)
        public string UserId { get; set; } = string.Empty;

        // علاقة: السلة تحتوي على عدة عناصر
        public List<CartItem> Items { get; set; } = new List<CartItem>();
    }
}