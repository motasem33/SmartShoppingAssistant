using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using System.Linq;
using System.Threading.Tasks;

namespace SmartShoppingAssistant.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        // استخدام نظام Identity الرسمي بدلاً من DbContext المباشر
        private readonly UserManager<IdentityUser> _userManager;

        public UsersController(UserManager<IdentityUser> userManager)
        {
            _userManager = userManager;
        }

        // جلب المستخدمين
        [HttpGet]
        public IActionResult GetUsers()
        {
            // IdentityUser يستخدم Id من نوع نصي (string)
            var users = _userManager.Users.Select(u => new { id = u.Id, email = u.Email, role = "User" }).ToList();
            return Ok(users);
        }

        // إضافة مستخدم جديد (مع تشفير كلمة المرور تلقائياً)
        [HttpPost]
        public async Task<IActionResult> AddUser([FromBody] UserDto model)
        {
            var user = new IdentityUser { UserName = model.Email, Email = model.Email };
            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                return Ok(new { id = user.Id, email = user.Email, role = model.Role });
            }
            return BadRequest("فشل إضافة المستخدم. تأكد أن كلمة المرور قوية (تحتوي على حروف وأرقام ورموز).");
        }

        // دالة تعديل المستخدم (تمت إضافتها لتفعيل زر التعديل)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(string id, [FromBody] UserDto model)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound("المستخدم غير موجود");
            }

            // تحديث البيانات الأساسية
            user.Email = model.Email;
            user.UserName = model.Email;

            // إذا تم إرسال كلمة مرور جديدة، يتم تغييرها
            if (!string.IsNullOrEmpty(model.Password))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                await _userManager.ResetPasswordAsync(user, token, model.Password);
            }

            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return Ok(new { message = "تم تحديث بيانات المستخدم بنجاح" });
            }

            return BadRequest("حدث خطأ أثناء التحديث");
        }

        // حذف مستخدم
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user != null)
            {
                await _userManager.DeleteAsync(user);
            }
            return Ok(new { message = "تم الحذف بنجاح" });
        }
    }

    // كلاس بسيط لاستقبال البيانات من الجافاسكريبت
    public class UserDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "User";
    }
}