export function crescentIcon(px: number) {
  const bg = "#064e3b";
  const gold = "#fbbf24";
  const moon = Math.round(px * 0.56);
  const bite = Math.round(px * 0.62);
  return (
    <div
      style={{
        width: px,
        height: px,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: moon,
          height: moon,
          borderRadius: "50%",
          background: gold,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: bite,
          height: bite,
          borderRadius: "50%",
          background: bg,
          transform: `translate(${Math.round(px * 0.14)}px, -${Math.round(px * 0.06)}px)`,
        }}
      />
    </div>
  );
}
