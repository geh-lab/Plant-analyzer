import {
  CartesianGrid,
  Dot,
  ErrorBar,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { displayNumber } from "@/utils/resultData";

const colors = Array.from(
  { length: 6 },
  (_, index) => "var(--fp-line-" + index + ")",
);
const dashes = [undefined, "7 3", "2 3", "9 2 2 2"];
export default function Fp100Chart({ curves, groups, label, en, paletteOrder = groups, axis, showError = false, logYDomain }) {
  const palette = new Map(paletteOrder.map((name, index) => [name, {
    color: colors[index % colors.length],
    dash: dashes[index % dashes.length],
  }]));
  const keys = new Map(groups.map((group, index) => [group, "group" + index]));
  const values = curves.map(({ t, series }) => {
    const row = { t };
    for (const { group, mean, se } of series) {
      const key = keys.get(group);
      row[key] = mean;
      row[key + "SE"] = Number.isFinite(se) ? se : null;
    }
    return row;
  });
  const chartLabel = axis?.label || (en ? "Measured time (ms, log scale)" : "측정 시간 (ms, 로그 눈금)");
  const category = axis?.type === "category";
  const logTime = !axis;
  const ticker = value => category ? String(value) : displayNumber(value);
  const empty = !curves.some(({ series }) =>
    series.some((s) => Number.isFinite(s.mean)),
  );
  if (empty)
    return (
      <p className="fp-state" role="status">
        {en
          ? "No matching values. Check the landmark times, recorded peak and shared control times."
          : "선택한 구간에 표시할 값이 없습니다. 기준 시점, 최고 형광, 대조구와 공통인 시각을 확인하세요."}
      </p>
    );
  const min = values[0].t,
    max = values.at(-1).t;
  let ticks = axis?.ticks;
  if (logTime) {
    const decades = [];
    for (let n = Math.ceil(Math.log10(min)); n <= Math.floor(Math.log10(max)); n++) decades.push(10 ** n);
    ticks = [...new Set([min, ...decades, max])].sort((a, b) => a - b);
  }
  return (
    <figure className="fp-chart" aria-label={label}>
      <figcaption>{label}</figcaption>
      <div>
        <ResponsiveContainer width="100%" height={290} minWidth={0}>
          <LineChart
            data={values}
            margin={{ top: 10, right: 16, left: 0, bottom: 23 }}
          >
            <CartesianGrid
              strokeDasharray="3 4"
              vertical={false}
              stroke="var(--ui-line)"
            />
            <XAxis
              dataKey="t"
              type={category ? "category" : "number"}
              scale={logTime ? "log" : "auto"}
              domain={category ? undefined : (min === max ? (logTime ? [min / 2, max * 2] : [min - 1, max + 1]) : [min, max])}
              ticks={ticks}
              tickFormatter={ticker}
              tick={{ fontSize: ".6875rem", fill: "var(--ui-muted)" }}
              minTickGap={20}
              label={{
                value: chartLabel,
                position: "insideBottom",
                offset: -12,
                fill: "var(--ui-muted)",
                fontSize: ".75rem",
              }}
            />
            <YAxis
              tick={{ fontSize: ".6875rem", fill: "var(--ui-muted)" }}
              width={51}
              tickFormatter={displayNumber}
              scale={logYDomain ? "log" : "auto"}
              domain={logYDomain || ["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                background: "var(--ui-panel)",
                borderColor: "var(--ui-line)",
                color: "var(--ui-ink)",
              }}
              formatter={(value, name) => [displayNumber(value), name]}
              labelFormatter={value => ticker(value) + (axis ? (axis.unit ? " " + axis.unit : "") : " ms")}
            />
            <Legend
              verticalAlign="top"
              iconType="plainline"
              wrapperStyle={{ fontSize: ".75rem", paddingBottom: 10 }}
            />
            {groups.map((group) => (
              <Line
                key={group}
                name={group}
                dataKey={keys.get(group)}
                type="linear"
                stroke={palette.get(group).color}
                strokeWidth={2}
                strokeDasharray={palette.get(group).dash}
                isAnimationActive={false}
                connectNulls={false}
                dot={
                  values.length < 15
                    ? ({ cx, cy, index: pt }) =>
                        Number.isFinite(cx) && Number.isFinite(cy) ? (
                          <Dot
                            key={pt}
                            cx={cx}
                            cy={cy}
                            r={2.5}
                            fill={palette.get(group).color}
                          />
                        ) : (
                          <g key={pt} />
                        )
                    : false
                }
              >
                {showError && <ErrorBar dataKey={keys.get(group) + "SE"} width={3} stroke={palette.get(group).color} />}
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
