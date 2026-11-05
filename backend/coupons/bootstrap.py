import os
import traceback


def prepare_database():
    """Apply pending migrations and create the admin user from env vars.

    Serverless hosts have no deploy hook to run `migrate`, so this runs once
    per cold start. Both steps are no-ops when there is nothing to do.
    """
    try:
        from django.contrib.auth import get_user_model
        from django.core.management import call_command
        from django.db import connection
        from django.db.migrations.executor import MigrationExecutor

        executor = MigrationExecutor(connection)
        if executor.migration_plan(executor.loader.graph.leaf_nodes()):
            call_command('migrate', interactive=False, verbosity=1)

        username = os.environ.get('DJANGO_ADMIN_USERNAME')
        password = os.environ.get('DJANGO_ADMIN_PASSWORD')
        if username and password:
            User = get_user_model()
            if not User.objects.filter(username=username).exists():
                User.objects.create_superuser(username, '', password)
                print(f'Created admin user "{username}"')
    except Exception:
        # Keep serving; the error shows up in the function logs.
        traceback.print_exc()
