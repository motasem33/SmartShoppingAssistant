using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartShoppingAssistant.Data;
using SmartShoppingAssistant.DTOs;
using SmartShoppingAssistant.Models;
using System.Security.Claims;

namespace SmartShoppingAssistant.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // 🔒 هذا السطر هو السحر! يمنع أي شخص غير مسجل الدخول من استخدام هذا الـ Controller
    public class CartController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CartController(ApplicationDbContext context)
        {
            _context = context;
        }

        // دالة مساعدة صغيرة لاستخراج "رقم المستخدم" من الـ Token الخاص به
        private string GetUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        }

        // 1. جلب سلة المشتريات الخاصة بالمستخدم الحالي
        [HttpGet]
        public async Task<ActionResult<Cart>> GetMyCart()
        {
            var userId = GetUserId();

            // نبحث عن السلة الخاصة بهذا المستخدم، ونجلب معها المنتجات التي بداخلها
            var cart = await _context.Carts
                .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            // إذا كان المستخدم جديداً وليس لديه سلة، ننشئ له واحدة فوراً
            if (cart == null)
            {
                cart = new Cart { UserId = userId };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            return Ok(cart);
        }

        // 2. إضافة منتج إلى السلة
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart(AddToCartDto model)
        {
            var userId = GetUserId();
            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart { UserId = userId };
                _context.Carts.Add(cart);
            }

            // نتحقق إذا كان المنتج موجوداً مسبقاً في السلة لكي نزيد الكمية فقط بدلاً من تكراره
            var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == model.ProductId);
            if (existingItem != null)
            {
                existingItem.Quantity += model.Quantity;
            }
            else
            {
                // إذا لم يكن موجوداً، نضيفه كعنصر جديد
                cart.Items.Add(new CartItem
                {
                    ProductId = model.ProductId,
                    Quantity = model.Quantity
                });
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = "تم إضافة المنتج إلى السلة بنجاح!" });
        }
    }
}