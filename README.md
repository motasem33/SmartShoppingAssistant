<div align="center">
  <img src="https://placehold.co/800x200/0d1117/58a6ff?text=Smart+Shopping+Assistant&font=Roboto" alt="Smart Shopping Assistant Banner">
  <br><br>
  <p><b>مساعدك الذكي لإدارة وتنظيم التسوق بكفاءة عالية</b></p>
</div>

---

## 📖 نبذة عن المشروع (About)
**SmartShoppingAssistant** هو تطبيق ويب متكامل مبني باستخدام إطار عمل **.NET (ASP.NET Core)**. يهدف المشروع إلى توفير تجربة تسوق ذكية من خلال إدارة المنتجات والطلبات بكفاءة، مع الاعتماد على أفضل المعايير في بناء الهيكلية البرمجية لتنظيف الكود وسهولة صيانته.

## 🛠️ التقنيات المستخدمة (Tech Stack)
* **Backend:** C#, ASP.NET Core
* **Database:** SQL Server, Entity Framework Core (Code-First & Migrations)
* **Architecture:** MVC / RESTful API
* **Data Handling:** DTOs (Data Transfer Objects)
* **Frontend:** HTML5, CSS3, Bootstrap, JavaScript (متواجدة في مجلد `wwwroot`)

## 📁 هيكلية المجلدات (Folder Structure)
تم تقسيم المشروع بشكل احترافي لفصل المهام:
* `Controllers/`: يحتوي على متحكمات التطبيق لمعالجة مسارات الويب والـ APIs.
* `Models/`: يضم الكائنات الأساسية التي تمثل جداول قاعدة البيانات.
* `DTOs/`: كائنات وسيطة لنقل البيانات بأمان بين واجهة المستخدم وقاعدة البيانات.
* `Data/`: يحتوي على إعدادات الـ `DbContext` للاتصال بقاعدة البيانات.
* `Migrations/`: ملفات تتبع تغييرات قاعدة البيانات (EF Core Migrations).
* `wwwroot/`: يحتوي على الملفات الثابتة مثل الصور، وتنسيقات CSS، وملفات JS.

## 🚀 كيفية التشغيل (How to Run)
لتشغيل المشروع على جهازك المحلي، اتبع الخطوات التالية:

1. **استنساخ المستودع (Clone):**
   ```bash
   git clone [https://github.com/motasem33/SmartShoppingAssistant.git](https://github.com/motasem33/SmartShoppingAssistant.git)
