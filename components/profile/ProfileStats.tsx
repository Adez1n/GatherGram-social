type ProfileStatsProps = {
  posts: number;
  followers: number;
  following: number;
};

function formatCount(value: number) {
  return new Intl.NumberFormat("es", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function ProfileStats({
  posts,
  followers,
  following,
}: ProfileStatsProps) {
  return (
    <dl className="grid grid-cols-3 gap-2 border-y border-[#2E2E2E] py-4 text-center sm:max-w-md sm:text-left">
      <div>
        <dt className="text-xs font-bold uppercase tracking-normal text-[#A3A3A3]">
          Posts
        </dt>
        <dd className="mt-1 text-lg font-black text-[#F5F5F5]">
          {formatCount(posts)}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-bold uppercase tracking-normal text-[#A3A3A3]">
          Seguidores
        </dt>
        <dd className="mt-1 text-lg font-black text-[#F5F5F5]">
          {formatCount(followers)}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-bold uppercase tracking-normal text-[#A3A3A3]">
          Siguiendo
        </dt>
        <dd className="mt-1 text-lg font-black text-[#F5F5F5]">
          {formatCount(following)}
        </dd>
      </div>
    </dl>
  );
}
