import { useMemo, useState } from "react";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import StudioSelect from "@/components/StudioSelect";
import { fpGroups } from "@/utils/fp100";
import { displayNumber } from "@/utils/resultData";

const profiles = {
  yields: ["Mo", "Fv/Fm", "VJ", "VI", "ΨEo", "ΦEo", "ΦDo", "δRo", "ΦRo"],
  rc: ["ABS/RC", "TRo/RC", "ETo/RC", "DIo/RC", "REo/RC"],
  cs: ["ABS/CSm", "TRo/CSm", "ETo/CSm", "DIo/CSm", "REo/CSm"],
};

export default function Fp100Profile({ leaves, groups, control, en }) {
  const [family, setFamily] = useState("yields");
  const t = (ko, eng) => (en ? eng : ko);
  const { rows, shown, missing } = useMemo(() => {
    const ids = new Map(groups.map((group, i) => [group, "group" + i]));
    const rows = profiles[family].map((metric) => {
      const row = { metric };
      for (const { group, relative } of fpGroups(leaves, metric, control))
        row[ids.get(group)] = relative;
      return row;
    });
    const shown = groups
      .map((group, i) => ({ group, id: ids.get(group), index: i }))
      .filter(({ id }) =>
        rows.every((row) => Number.isFinite(row[id]) && row[id] >= 0),
      );
    return {
      rows,
      shown,
      missing: groups.filter((group) => !shown.some((s) => s.group === group)),
    };
  }, [leaves, groups, control, family]);
  return (
    <div className="fp-profile">
      <div className="fp-inputs">
        <label>
          {t("대조구 정규화 프로필", "Control-normalized profile")}
          <StudioSelect
            aria-label={t("프로필 지표군", "Profile parameters")}
            value={family}
            onValueChange={setFamily}
            options={[
              {
                value: "yields",
                label: t(
                  "형광 지표와 양자 수율",
                  "Fluorescence indices & yields",
                ),
              },
              {
                value: "rc",
                label: t("반응 중심당 에너지 플럭스", "Energy flux per RC"),
              },
              {
                value: "cs",
                label: t("단면당 에너지 플럭스", "Energy flux per CSm"),
              },
            ]}
          />
        </label>
      </div>
      {shown.length > 0 && (
        <figure className="fp-chart">
          <figcaption>
            {t("처리구 평균 / 대조구 평균", "Treatment mean / control mean")} ·{" "}
            {control} = 1
          </figcaption>
          <div>
            <ResponsiveContainer width="100%" height={290} minWidth={0}>
              <RadarChart
                data={rows}
                outerRadius="66%"
                margin={{ top: 8, right: 5, bottom: 7, left: 5 }}
              >
                <PolarGrid stroke="var(--ui-line)" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fontSize: ".6875rem", fill: "var(--ui-muted)" }}
                />
                <PolarRadiusAxis
                  angle={95}
                  tickCount={4}
                  domain={[0, "auto"]}
                  tick={{ fontSize: ".625rem", fill: "var(--ui-muted)" }}
                  tickFormatter={(v) => Number(v.toPrecision(2))}
                />
                <Tooltip
                  formatter={(v, n) => [displayNumber(v), n]}
                  contentStyle={{
                    color: "var(--ui-ink)",
                    background: "var(--ui-panel)",
                    borderColor: "var(--ui-line)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: ".75rem" }} />
                {shown.map(({ group, id, index }) => (
                  <Radar
                    key={id}
                    dataKey={id}
                    name={group}
                    fill="none"
                    stroke={"var(--fp-line-" + (index % 6) + ")"}
                    strokeWidth={group === control ? 1.5 : 2.2}
                    strokeDasharray={group === control ? "4 3" : undefined}
                    isAnimationActive={false}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </figure>
      )}
      {missing.length > 0 && (
        <p className="fp-note">
          {t(
            "선택한 축 전체에 유효한 비음수 배수가 필요한 처리구",
            "Groups missing a valid non-negative fold value on one or more axes",
          )}
          : {missing.join(", ")}
        </p>
      )}
    </div>
  );
}
