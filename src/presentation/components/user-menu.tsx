type UserMenuProps = {
  name?: string | null;
  email?: string | null;
  picture?: string | null;
};

export function UserMenu({ name, email, picture }: UserMenuProps) {
  return (
    <div className="flex items-center gap-3">
      {picture ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={picture}
          alt={name ?? "User"}
          className="h-8 w-8 rounded-full"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200">
          {(name ?? email ?? "?").charAt(0).toUpperCase()}
        </div>
      )}
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {name ?? "Signed in"}
        </p>
        {email ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{email}</p>
        ) : null}
      </div>
      <a
        href="/auth/logout"
        className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        Log out
      </a>
    </div>
  );
}
