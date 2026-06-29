type ProfileInfoProps = {
  name: string;
  username: string;
  bio: string | null;
  createdAt: string;
};

function formatJoinedDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default function ProfileInfo({
  name,
  username,
  bio,
  createdAt,
}: ProfileInfoProps) {
  return (
    <div className="min-w-0 space-y-3">
      <div className="min-w-0">
        <h1 className="truncate text-3xl font-black leading-tight text-[#F5F5F5]">
          {name}
        </h1>
        <p className="mt-1 truncate text-sm font-bold text-[#A3A3A3]">
          @{username}
        </p>
      </div>

      <p className="max-w-xl text-sm leading-6 text-[#D4D4D4]">
        {bio || "Sin bio por ahora."}
      </p>

      <p className="flex items-center gap-2 text-sm font-medium text-[#A3A3A3]">
        <i className="bi bi-calendar3" aria-hidden="true" />
        <span>Joined {formatJoinedDate(createdAt)}</span>
      </p>
    </div>
  );
}
