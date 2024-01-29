import { ChangeEventHandler, FC, useEffect, useMemo, useState } from "react";
import {
  BorderWrapper,
  InfoTooltip,
  InfoTooltipConnector,
  Row,
  InfoValue,
  PercentValue,
  InvestChart,
} from "./components";
import { getInvestmentState } from "./utils";
import { IREState } from "./types";
import {
  DEFAULT_INVEST,
  INITIAL_STATE,
  MAX_INVEST,
  MIN_INVEST,
  INVEST_DATA,
} from "./constants";
import cl from "classnames";
import styles from "./InvestmentCalculator.module.scss";
import RangeSlider from "./components/RangeSlider/RangeSlider";

interface IProps {
  propertyId: string;
  className?: string;
  data?: { [key: string]: string | null };
}

const InvestmentCalculator: FC<IProps> = ({ className, data }) => {
  
  const [investment, setInvestment] = useState<number>(DEFAULT_INVEST.label);
  const [investIndex,setInvestIndex] = useState<number>(DEFAULT_INVEST.index)
  const [widthWindow, setWidthWindow] = useState<number | null>(null);
  const [isTooltipActive, setIsActive] = useState(false);


  const [hoveredYear, setYear] = useState<number>(new Date().getFullYear() + 1);


  useEffect(() => {
    const handleResize = (event: any) => {
      setWidthWindow(event.target.innerWidth);
    };
    setWidthWindow(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handlerChange = (index:number) =>{
    let foundedAmount = INVEST_DATA.find(el=>el.index === index)
  
    setInvestIndex(index)
    if(foundedAmount){
      setInvestment(foundedAmount.label)
    } 
  
  }

  const findClosestLabel = (targetValue:number, data:Array<{[key:string]:number}>) => {
    let closestObject = data[0];
    let closestDifference = Math.abs(targetValue - data[0].label);
  
    for (let i = 1; i < data.length; i++) {
      const currentDifference = Math.abs(targetValue - data[i].label);
  
      if (currentDifference < closestDifference) {
        closestDifference = currentDifference;
        closestObject = data[i];
      }
    }
  
    return closestObject;
  };

  const handlerChangeByLabel = (valueLabel:number) =>{
    
    const closestData = findClosestLabel(valueLabel,INVEST_DATA)
    setInvestment(valueLabel)
    setInvestIndex(closestData.index)


  }


  const DEVICE_WITH = 768;

  const year = useMemo(() => {
    return new Date().getFullYear();
  }, []);

  const { chartData, investmentValue, rentalIncome, valueAppreciation } =
    useMemo(
      () => getInvestmentState(investment, year, INITIAL_STATE),
      [investment, year]
    );

  const isHoveredLastElement =
    hoveredYear === chartData[chartData.length - 1].year;

  const toolTip = (
    <InfoTooltip
      className={styles.bottom__info}
      contentHTML={data?.calc_bottomTooltip}
    />
  );
  const expectedYield = (
    <Row>
      <div className={styles.expected_yield_fields_wrapper}>
        <div className={styles.expected_yield_title_wrapper}>
          <p className={styles.expected_yield_title}>{data?.calc_bottomHead}</p>
          {widthWindow !== null && widthWindow > DEVICE_WITH ? toolTip : null}
        </div>
        <div className={styles.calculator__exp_field}>
          <PercentValue value={data?.calc_expected_yield || 0} />
        </div>
      </div>
    </Row>
  );

  const rangeMain = (
    <div className={styles.range_wrapper}>
      <RangeSlider
      defaultValue={DEFAULT_INVEST.index}
      max={MAX_INVEST.index}
      min={MIN_INVEST.index}
      minLabel={MIN_INVEST.label}
      maxLabel={MAX_INVEST.label}
      step={1}
      label={data?.calc_labelRInvestment}
      type="usd"
      expFieldComp={expectedYield}
      amountValue={investIndex}
      amountValueLabel={investment}
        onChange={handlerChange}
        onChangeByLabel={handlerChangeByLabel}
      />
    </div>
  );

  return (
    <div className={styles.calc_wrapper}>
      <div className={styles.setting}>
        <div className={styles.head}>
          <Row>
            {/* <h1 className={styles.head__title}>
              {data?.calc_title} <strong>{data?.calc_titleStrong}</strong>
            </h1> */}
            {/* <InfoTooltip
              className={styles.head__info}
              contentHTML={data?.calc_headTooltip}
            /> */}
          </Row>
          <h2 className={styles.head__caption}>{data?.calc_caption}</h2>
        </div>

        {widthWindow !== null && widthWindow > 1280 ? rangeMain : null}
      </div>

      {widthWindow !== null && widthWindow <= 1280 ? rangeMain : null}

      <div className={cl(className, styles.calculator)} id={"calculator"}>
        <div className={styles.calculator__info_wrapper}>
          <BorderWrapper
            className={cl(
              styles.calculator__info,
              isHoveredLastElement && styles.calculator__info__lastBarHovered
            )}
          >
            <InfoValue
              color="50"
              label={data?.calc_labelInvestment}
              value={investmentValue}
              isActiveTooltip={isTooltipActive}
              lastElementTooltipStyle={isHoveredLastElement}
            />
            <InfoValue
              color="300"
              label={data?.calc_labelRental}
              value={rentalIncome}
              isActiveTooltip={isTooltipActive}
              lastElementTooltipStyle={isHoveredLastElement}
            />
            <InfoValue
              color="500"
              label={data?.calc_labelAppreciation}
              value={valueAppreciation}
              isActiveTooltip={isTooltipActive}
              lastElementTooltipStyle={isHoveredLastElement}
            />
          </BorderWrapper>
        </div>

        <div
          className={cl(
            styles.calculator__info_wrapper,
            styles.calculator__info_wrapper__mobile
          )}
        >
          <BorderWrapper
            className={cl(
              styles.calculator__info,
              isHoveredLastElement && styles.calculator__info__lastBarHovered
            )}
          >
            <InfoValue
              color="300"
              label={data?.calc_labelRental}
              value={rentalIncome}
              isActiveTooltip={isTooltipActive}
              lastElementTooltipStyle={isHoveredLastElement}
            />
            <InfoValue
              color="500"
              label={data?.calc_labelAppreciation}
              value={valueAppreciation}
              isActiveTooltip={isTooltipActive}
              lastElementTooltipStyle={isHoveredLastElement}
            />
          </BorderWrapper>
        </div>

        <InvestChart
          data={chartData}
          totalLabel={data?.calc_totalLabel || "Total"}
          setIsActive={setIsActive}
          setYear={setYear}
          viewWidth={DEVICE_WITH}
        />

        <InfoTooltipConnector />
      </div>

      <div className={styles.decor} />
    </div>
  );
};

export default InvestmentCalculator;
