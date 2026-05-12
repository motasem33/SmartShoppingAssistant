using System.ComponentModel.DataAnnotations.Schema;

namespace SmartShoppingAssistant.Models
{
    public class CartItem
    {
        public int Id { get; set; }
        public int CartId { get; set; } // رقم السلة
        public int ProductId { get; set; } // رقم المنتج
        public int Quantity { get; set; } // الكمية المطلوبة

        // علاقة لجلب بيانات المنتج مباشرة (مثل السعر والاسم) عند عرض السلة
        [ForeignKey("ProductId")]
        public Product? Product { get; set; }
    }
}