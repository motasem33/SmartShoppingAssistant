using System;
using System.Collections.Generic;

namespace SmartShoppingAssistant.Models
{
    public class Order
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; } = DateTime.Now;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "قيد الانتظار"; // حالات الطلب: قيد الانتظار، مشحون، مكتمل

        // علاقة الطلب بالمنتجات اللي جواه
        public List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}