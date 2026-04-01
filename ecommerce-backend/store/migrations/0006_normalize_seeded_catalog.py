from django.db import migrations


def normalize_catalog(apps, schema_editor):
    Category = apps.get_model("store", "Category")
    Product = apps.get_model("store", "Product")

    category_map = {
        "Electronics": "electronics",
        "Fashion": "fashion",
        "Home Appliances": "home",
    }

    for old_name, new_name in category_map.items():
        try:
            old_category = Category.objects.get(name=old_name)
        except Category.DoesNotExist:
            continue

        new_category, _ = Category.objects.get_or_create(name=new_name)
        Product.objects.filter(category=old_category).update(category=new_category)
        old_category.delete()

    Product.objects.filter(name="Iphone 18 Pro Max").delete()


class Migration(migrations.Migration):

    dependencies = [
        ("store", "0005_seed_products"),
    ]

    operations = [
        migrations.RunPython(normalize_catalog, migrations.RunPython.noop),
    ]
