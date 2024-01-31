import { FC, memo, useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CustomTooltip } from "./CustomTooltip";
import styles from "./InvestChart.module.scss";
import { useRouter } from "next/router";
import { AxisDomain } from "recharts/types/util/types";

export interface IInvestChart {
  investment: number;
  rental: number;
  appreciation: number;
  year: number | string;
}

interface IProps {
  data: IInvestChart[];
  totalLabel: string | null;
  setIsActive: (arg: boolean) => void;
  setYear: (value: number) => void;
  viewWidth: number;
}

interface IStackedBarValues {
  year: number;
  barValue: number;
}

// eslint-disable-next-line react/display-name
export const InvestChart: FC<IProps> = memo(
  ({ data, totalLabel, setIsActive, setYear, viewWidth }) => {
    const { locale } = useRouter();
    const [width, setWidth] = useState<any>();
    const [isOutsideClicked, setIsOutsideClicked] = useState<boolean>(false);

    const [tooltipPositionX, setTooltipPositionX] = useState<number>(0);
    const [tooltipPositionY, setTooltipPositionY] = useState<number>(0);

    const [tempYear, setTempYear] = useState<number>(0);

    const getStackedBarValues = ({ year, barValue }: IStackedBarValues) => {
      let value;
      switch (year) {
        case 2025:
          value = barValue * 4.5;
          break;
        case 2026:
          value = barValue * 4;
          break;
        case 2027:
          value = barValue * 4;
          break;
        case 2028:
          value = barValue * 4;
          break;
        case 2029:
          value = barValue * 4;
          break;

        default:
          break;
      }
      return value;
    };

    const rightData =
      locale === "ar"
        ? data.sort((a: any, b: any) => b.year - a.year)
        : data.map((el) => ({
            ...el,
            rentalAsLabel: getStackedBarValues({
              year: el.year as number,
              barValue: el.rental,
            }),
            appreciationAsLabel: getStackedBarValues({
              year: el.year as number,
              barValue: el.appreciation,
            }),
          }));

    // const shiftedMinValue = Math.round(
    //   Math.min(
    //     ...rightData.map(
    //       (el) =>
    //         Number(el.investment) + Number(el.appreciation) + Number(el.rental)
    //     )
    //   ) * 0.85
    // );

    const wrapperRef = useRef<any>(null);

    const orientation = locale === "ar" ? "right" : "left";

    function getPositions() {
      const activeBars = document.querySelectorAll(".recharts-active-bar");
      const containerItem = document.getElementsByClassName(
        "recharts-responsive-container"
      );

      const allX: number[] = [];
      let totalHeight = 0;

      activeBars.forEach((bar: any) => {
        const boundingRec = bar.getBoundingClientRect();
        totalHeight += boundingRec.height;
        allX.push(boundingRec.x);
      });

      const tooltipHeight = Math.max(
        document.getElementById("investment-tooltip")?.getBoundingClientRect()
          ?.height ?? 0,
        width < 768 ? 98 : 113
      );

      const finalPos = 160 - Math.ceil(totalHeight) - Math.ceil(tooltipHeight);

      const xPos =
        Math.min(...allX) - containerItem?.[0]?.getBoundingClientRect?.()?.x;

      setTooltipPositionY(finalPos);
      setTooltipPositionX(xPos);
    }

    function handleHeight(_data: any) {
      const itemIndex = _data.activeTooltipIndex;
      const year = data[itemIndex]?.year ?? 0;

      setYear(Number(year));
      setTempYear(Number(year));

      getPositions();
    }

    useEffect(() => {
      getPositions();
    }, [tempYear]);

    useEffect(() => {
      const handleResize = (event: any) => {
        setWidth(event.target.innerWidth);
      };
      setWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, []);

    useEffect(() => {
      const isClicked = (e: any) => {
        if (wrapperRef.current && !wrapperRef?.current?.contains(e.target)) {
          setIsOutsideClicked(true);
        } else {
          setIsOutsideClicked(false);
        }
      };

      document.addEventListener("click", isClicked);

      return () => {
        document.removeEventListener("click", isClicked);
      };
    }, []);

    const isMob = width != null && width < 475;
    const isTabletOrMob = width != null && width < 991;

    const calculateDomain = () => {
      let domain: Array<string | number> = [];
      if (rightData[0].investment <= 500) {
        domain = [0, "dataMax + 100"];
      } else if (
        rightData[0].investment > 500 &&
        rightData[0].investment <= 2000
      ) {
        domain = [0, "dataMax + 200"];
      } else if (
        rightData[0].investment > 2000 &&
        rightData[0].investment <= 10000
      ) {
        domain = [0, "dataMax + 500"];
      } else if (
        rightData[0].investment > 10000 &&
        rightData[0].investment <= 50000
      ) {
        domain = [0, "dataMax + 800"];
      } else {
        domain = [0, "dataMax + 1200"];
      }
      return domain;
    };

    return (
      <div className={styles.chart__wrapper} ref={wrapperRef}>
        {data && data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={344}
              data={rightData}
              margin={{
                top: 0,
                right: 0,
                left: 0,
                bottom: 0,
              }}
              className={styles.chart_styles}
              onMouseMove={handleHeight}
              onMouseLeave={() => setYear(0)}
              barSize={76}
            >
              <defs>
                <linearGradient id="g1" x1=".5" x2=".5" y2="1">
                  <stop
                    stopOpacity="0"
                    className={styles["stop-hover-start"]}
                  />
                  <stop offset="1.324" className={styles["stop-hover-end"]} />
                </linearGradient>
                <linearGradient id="lg500" x1=".5" x2=".5" y2="1">
                  <stop className={styles["stop-500"]} />
                </linearGradient>
                <linearGradient id="lg300" x1=".5" x2=".5" y2="1">
                  <stop className={styles["stop-300"]} />
                </linearGradient>
                <linearGradient id="lg50" x1=".5" x2=".5" y2="1">
                  <stop className={styles["stop-50"]} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                className={styles.chart__cartesian}
                strokeWidth={1}
              />
              <XAxis
                dataKey="year"
                tickLine={false}
                height={24}
                tick={{ dy: 6 }}
                style={{
                  fontSize: "100%",
                }}
              />
              <YAxis
                type="number"
                style={{
                  fontSize: "100%",
                }}
                axisLine={false}
                tickLine={true}
                orientation={orientation}
                interval={0}
                domain={calculateDomain() as AxisDomain}
                allowDataOverflow={true}
                hide
                stroke="none"
              />
              <Tooltip
                cursor={{ fill: isMob ? "none" : "url(#g1)" }}
                allowEscapeViewBox={{ x: true, y: true }}
                wrapperStyle={{
                  outline: "none",
                  width: 5,
                  // top:-120,
                  // left: -47,
                }}
                position={{
                  x: tooltipPositionX,
                  y: tooltipPositionY,
                }}
                // active={false}
                // isAnimationActive={false}

                // allowEscapeViewBox={{x:false,y:false}}
                // viewBox={{ x: 0, y: 0, width: 400, height: 400 }}

                content={
                  <CustomTooltip
                    totalLabel={totalLabel}
                    isTabletOrMob={isTabletOrMob}
                    active={false}
                    isOutsideClicked={isOutsideClicked}
                    setIsActive={setIsActive}
                    setYear={setYear}
                  />
                }
                // isAnimationActive={false}
              />
              <Bar
                dataKey="investment"
                stackId="a"
                fill="url(#lg500)"
                radius={[0, 0, 4, 4]}
              />

              <Bar dataKey="rentalAsLabel" stackId="a" fill="url(#lg300)" />

              <Bar
                dataKey="appreciationAsLabel"
                stackId="a"
                fill="url(#lg50)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  }
);
