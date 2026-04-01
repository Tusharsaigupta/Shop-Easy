from django.db import migrations, models


def seed_stock(apps, schema_editor):
    Product = apps.get_model("store", "Product")
    Product.objects.all().update(stock=25)
    Product.objects.filter(name="Nike Shoes").update(stock=10)


class Migration(migrations.Migration):

    dependencies = [
        ("store", "0006_normalize_seeded_catalog"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="stock",
            field=models.PositiveIntegerField(default=25),
        ),
        migrations.RunPython(seed_stock, migrations.RunPython.noop),
    ]
