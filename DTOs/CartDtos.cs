using System.ComponentModel.DataAnnotations;

namespace SmartShoppingAssistant.DTOs
{
    public class AddToCartDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, 100, ErrorMessage = "الكمية يجب أن تكون بين 1 و 100")]
        public int Quantity { get; set; }
    }
}