using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace SmartShoppingAssistant.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly SignInManager<IdentityUser> _signInManager;

        public AuthController(UserManager<IdentityUser> userManager, SignInManager<IdentityUser> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }

        // دالة إنشاء حساب جديد (Register)
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            if (string.IsNullOrEmpty(model.Email) || string.IsNullOrEmpty(model.Password))
                return BadRequest(new { message = "الرجاء إدخال البريد الإلكتروني وكلمة المرور" });

            var user = new IdentityUser { UserName = model.Email, Email = model.Email };
            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                return Ok(new { message = "تم إنشاء الحساب بنجاح" });
            }

            // إرجاع رسالة الخطأ (مثل: كلمة المرور ضعيفة) للواجهة
            return BadRequest(new { message = result.Errors.FirstOrDefault()?.Description ?? "فشل إنشاء الحساب" });
        }

        // دالة تسجيل الدخول (Login)
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            if (string.IsNullOrEmpty(model.Email) || string.IsNullOrEmpty(model.Password))
                return BadRequest(new { message = "بيانات الدخول غير مكتملة" });

            // فحص صحة البيانات مع قاعدة البيانات
            var result = await _signInManager.PasswordSignInAsync(model.Email, model.Password, isPersistent: false, lockoutOnFailure: false);

            if (result.Succeeded)
            {
                // إرجاع توكن بسيط (Token) لتخزينه في المتصفح وتأكيد الدخول
                return Ok(new { token = "smart-store-auth-token-123", message = "تم تسجيل الدخول بنجاح" });
            }

            return Unauthorized(new { message = "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
        }
    }

    // كلاسات مساعدة لاستقبال البيانات من الجافاسكريبت
    public class RegisterDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}