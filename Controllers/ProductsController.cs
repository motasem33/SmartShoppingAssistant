using Microsoft.AspNetCore.Mvc;
using SmartShoppingAssistant.Data;
using SmartShoppingAssistant.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartShoppingAssistant.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // جلب كل المنتجات - تعرض للزبائن وللأدمن
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products.ToListAsync();
        }

        // إضافة منتج جديد - يدعم الاسم والسعر ورابط الصورة
        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct([FromBody] Product product)
        {
            if (product == null)
            {
                return BadRequest("بيانات المنتج غير مكتملة");
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // نرجع المنتج الذي تم إنشاؤه مع الآيدي الجديد من SQL
            return CreatedAtAction(nameof(GetProducts), new { id = product.Id }, product);
        }

        // تعديل منتج موجود 
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, [FromBody] Product product)
        {
            if (id != product.Id)
            {
                return BadRequest();
            }

            _context.Entry(product).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // حذف المنتج - يعمل مع زر الحذف في لوحة التحكم
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                return NotFound(); // إذا لم يجد المنتج في SQL
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = "تم حذف المنتج بنجاح من قاعدة البيانات" });
        }

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.Id == id);
        }
    }
}