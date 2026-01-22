
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ParamInput = ({ label, value, onChange, placeholder, type = "number" }) => (
  <div>
    <Label className="text-gray-600 text-sm">{label}</Label>
    <Input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="ios-input border-0 text-gray-900 placeholder:text-gray-400"
    />
  </div>
);

const HighlightedValue = ({ value, placeholder }) => (
  <span className={`transition-colors duration-300 ${value ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
    {value || placeholder}
  </span>
);

export default function CalculationParams({ analysisType, onParamsChange, initialParams = {} }) {
  const [params, setParams] = useState(initialParams);
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    setParams(initialParams);
    setIsApplied(Object.keys(initialParams).length > 0 && Object.values(initialParams).some(v => v));
  }, [initialParams]);

  const handleParamChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
    setIsApplied(false);
  };

  const handleNestedParamChange = (group, key, value) => {
    setParams(prev => ({
      ...prev,
      [group]: {
        ...(prev[group] || {}),
        [key]: value
      }
    }));
    setIsApplied(false);
  };

  const handleApply = () => {
    onParamsChange(params);
    setIsApplied(true);
  };

  const renderParams = () => {
    switch (analysisType) {
      case "chlorophyll_a_b":
        return (
          <motion.div layout className="flex items-end gap-4">
            <div className="flex-grow space-y-2">
              <Label className="text-gray-600 text-sm">희석배수</Label>
              <Input
                type="number"
                value={params.dilutionFactor || ""}
                onChange={(e) => handleParamChange('dilutionFactor', e.target.value)}
                placeholder="예: 1, 10"
                className="ios-input border-0 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <Button onClick={handleApply} className="ios-button rounded-xl h-12 flex-shrink-0 flex items-center justify-center">
              {isApplied && params.dilutionFactor ? <CheckCircle className="h-4 w-4 mr-2" /> : null}
              {isApplied && params.dilutionFactor ? "적용됨" : "적용"}
            </Button>
            <AnimatePresence>
              {isApplied && params.dilutionFactor && (
                <motion.div
                  initial={{ opacity: 0, width: 0, x: -20 }}
                  animate={{ opacity: 1, width: 'auto', x: 0 }}
                  exit={{ opacity: 0, width: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="bg-blue-50 border border-blue-200 rounded-xl h-12 flex items-center px-4"
                >
                  <p className="text-blue-800 font-semibold whitespace-nowrap">
                    적용된 배수: {params.dilutionFactor}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      case "total_phenol":
      case "total_flavonoid":
        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-end gap-4">
              <div className="flex-1 w-full"><ParamInput label="기울기 (a)" value={params.std_a || ""} onChange={e => handleParamChange('std_a', e.target.value)} placeholder="Standard curve's slope" /></div>
              <div className="flex-1 w-full"><ParamInput label="Y절편 (b)" value={params.std_b || ""} onChange={e => handleParamChange('std_b', e.target.value)} placeholder="Standard curve's y-intercept" /></div>
              <Button onClick={handleApply} className="ios-button rounded-xl h-12 w-full sm:w-auto flex items-center justify-center">
                {isApplied && <CheckCircle className="h-4 w-4 mr-2" />}
                {isApplied ? "적용됨" : "적용"}
              </Button>
            </div>
            <p className="text-gray-800 font-mono p-3 bg-gray-100 rounded-lg text-center">
                y = <HighlightedValue value={params.std_a} placeholder="a" />x + (<HighlightedValue value={params.std_b} placeholder="b" />)
            </p>
          </div>
        );

case "h2o2":
        return (
          <div className="flex flex-col space-y-4">
            {/* 1. 입력 Row: 기울기, 절편, 그리고 적용 버튼 */}
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[150px]">
                <ParamInput 
                  label="기울기 (a)" 
                  value={params.h2o2?.a || ""} 
                  onChange={e => handleNestedParamChange('h2o2', 'a', e.target.value)} 
                  placeholder="Standard curve's slope" 
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <ParamInput 
                  label="Y절편 (b)" 
                  value={params.h2o2?.b || ""} 
                  onChange={e => handleNestedParamChange('h2o2', 'b', e.target.value)} 
                  placeholder="Standard curve's y-intercept" 
                />
              </div>
              
              {/* 버튼 위치: 입력창 바로 오른쪽 */}
              <div className="flex-shrink-0">
                <Button onClick={handleApply} className="ios-button rounded-xl h-12 flex items-center justify-center px-6">
                  {isApplied && <CheckCircle className="h-4 w-4 mr-2" />}
                  {isApplied ? "적용됨" : "적용"}
                </Button>
              </div>
            </div>

            {/* 2. 표준곡선 수식 표시 (깔끔하게 하단 배치) */}
            <div className="text-white font-mono p-4 bg-white/10 rounded-lg text-center text-sm">
               Standard Curve: y = <HighlightedValue value={params.h2o2?.a} placeholder="a" />x + (<HighlightedValue value={params.h2o2?.b} placeholder="b" />)
            </div>
          </div>
        );

        
      case "dpph_scavenging":
        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-end gap-4">
              <div className="flex-1 w-full"><ParamInput label="Control 흡광도" value={params.dpph_control || ""} onChange={e => handleParamChange('dpph_control', e.target.value)} placeholder="Absorbance of control" /></div>
              <Button onClick={handleApply} className="ios-button rounded-xl h-12 w-full sm:w-auto flex items-center justify-center">
                 {isApplied && <CheckCircle className="h-4 w-4 mr-2" />}
                 {isApplied ? "적용됨" : "적용"}
              </Button>
            </div>
            <p className="text-gray-800 font-mono p-3 bg-gray-100 rounded-lg text-center">
                Inhibition (%) = ((<HighlightedValue value={params.dpph_control} placeholder="Control" /> - Sample) / <HighlightedValue value={params.dpph_control} placeholder="Control" />) * 100
            </p>
          </div>
        );
case "anthocyanin":
        return (
           <div className="flex flex-col space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[120px]">
                <ParamInput label="추출 부피 (V, mL)" value={params.anthocyanin?.V || ""} onChange={e => handleNestedParamChange('anthocyanin', 'V', e.target.value)} placeholder="Default: 2" />
              </div>
              <div className="flex-1 min-w-[120px]">
                <ParamInput label="희석 배수 (n)" value={params.anthocyanin?.n || ""} onChange={e => handleNestedParamChange('anthocyanin', 'n', e.target.value)} placeholder="Default: 1" />
              </div>
              <div className="flex-1 min-w-[120px]">
                <ParamInput label="분자량 (Mw)" value={params.anthocyanin?.Mw || ""} onChange={e => handleNestedParamChange('anthocyanin', 'Mw', e.target.value)} placeholder="Default: 449.2" />
              </div>
              <div className="flex-1 min-w-[120px]">
                <ParamInput label="Molar absorptivity (ε)" value={params.anthocyanin?.epsilon || ""} onChange={e => handleNestedParamChange('anthocyanin', 'epsilon', e.target.value)} placeholder="Default: 26900" />
              </div>
              <div className="flex-1 min-w-[120px]">
                <ParamInput label="시료 무게 (m, g)" value={params.anthocyanin?.m || ""} onChange={e => handleNestedParamChange('anthocyanin', 'm', e.target.value)} placeholder="Default: 0.02" />
              </div>
              <div className="flex-shrink-0">
                 <Button onClick={handleApply} className="ios-button rounded-xl h-12 flex items-center justify-center px-6">
                   {isApplied && <CheckCircle className="h-4 w-4 mr-2" />}
                   {isApplied ? "적용됨" : "적용"}
                 </Button>
               </div>
            </div>
            <p className="text-gray-800 font-mono p-3 bg-gray-100 rounded-lg text-center text-sm">
                Anthocyanin = (A530 - A600) × <HighlightedValue value={params.anthocyanin?.V} placeholder="V"/> × <HighlightedValue value={params.anthocyanin?.n} placeholder="n"/> × <HighlightedValue value={params.anthocyanin?.Mw} placeholder="Mw"/> / (<HighlightedValue value={params.anthocyanin?.epsilon} placeholder="ε"/> × <HighlightedValue value={params.anthocyanin?.m} placeholder="m"/>)
            </p>
           </div>
        );

case "sod":
         const enzyme = "sod"; 
         
         return (
             <div className="flex flex-col space-y-4">
               {/* 1. 상단 입력창들 (기존 유지) */}
               <div className="flex flex-wrap items-end gap-4">
                 <div className="flex-1 min-w-[150px]">
                   <ParamInput label="Control Abs (560nm)" value={params.sod?.control_abs || ""} onChange={e => handleNestedParamChange('sod', 'control_abs', e.target.value)} placeholder="e.g., 0.800" />
                 </div>
                 <div className="flex-1 min-w-[120px]">
                   <ParamInput label="Total Volume (μL)" value={params.sod?.total_vol || ""} onChange={e => handleNestedParamChange('sod', 'total_vol', e.target.value)} placeholder="e.g., 200" />
                 </div>
                 <div className="flex-1 min-w-[120px]">
                   <ParamInput label="Enzyme Volume (μL)" value={params.sod?.enzyme_vol || ""} onChange={e => handleNestedParamChange('sod', 'enzyme_vol', e.target.value)} placeholder="e.g., 20" />
                 </div>
                 <div className="flex-1 min-w-[150px]">
                   <ParamInput label="Enzyme Conc. (mg/mL)" value={params.sod?.enzyme_conc || ""} onChange={e => handleNestedParamChange('sod', 'enzyme_conc', e.target.value)} placeholder="e.g., 10" />
                 </div>
                 <div className="flex-shrink-0">
                   <Button onClick={handleApply} className="ios-button rounded-xl h-12 flex items-center justify-center px-6">
                      {isApplied && <CheckCircle className="h-4 w-4 mr-2" />}
                      {isApplied ? "적용됨" : "적용"}
                   </Button>
                 </div>
               </div>

                {/* 2. 공식 표시 부분 (수정됨: 박스 2개로 분리) */}
                <div className="space-y-2"> {/* 박스 사이 간격 조절 */}
                   
                   {/* 박스 1: Inhibition 공식 */}
                   <div className="text-white font-mono p-4 bg-white/10 rounded-lg text-sm leading-relaxed text-center">
                     <>SOD inhibition (%)</> = ((<HighlightedValue value={params.sod?.control_abs} placeholder="Control"/> - <>Sample</>) / <HighlightedValue value={params.sod?.control_abs} placeholder="Control"/>) × 100
                   </div>

                   {/* 박스 2: Activity 공식 */}
                   <div className="text-white font-mono p-4 bg-white/10 rounded-lg text-sm leading-relaxed text-center">
                     <>SOD activity</> = (SOD inhibition (%) × <HighlightedValue value={params.sod?.total_vol} placeholder="total_vol"/>) / (50 × <HighlightedValue value={params.sod?.enzyme_vol} placeholder="enzyme_vol"/>) / <HighlightedValue value={params.sod?.enzyme_conc} placeholder="enzyme_conc"/>
                   </div>
                   
                </div>
            </div>
        );
// 2. CAT (Catalase) 분리
      case "cat":
        return (
           <div className="flex flex-col space-y-4">
             <div className="flex flex-wrap items-end gap-4">
               <div className="flex-1 min-w-[120px]">
                 <ParamInput label="Total Volume (μL)" value={params.cat?.total_vol || ""} onChange={e => handleNestedParamChange('cat', 'total_vol', e.target.value)} placeholder="e.g., 200" />
               </div>
               {/* CAT는 3uL 권장 */}
               <div className="flex-1 min-w-[120px]">
                 <ParamInput label="Enzyme Volume (μL)" value={params.cat?.enzyme_vol || ""} onChange={e => handleNestedParamChange('cat', 'enzyme_vol', e.target.value)} placeholder="e.g., 3" />
               </div>
               <div className="flex-1 min-w-[150px]">
                 <ParamInput label="Enzyme Conc. (mg/mL)" value={params.cat?.enzyme_conc || ""} onChange={e => handleNestedParamChange('cat', 'enzyme_conc', e.target.value)} placeholder="e.g., 10" />
               </div>
               <div className="flex-shrink-0">
                 <Button onClick={handleApply} className="ios-button rounded-xl h-12 flex items-center justify-center px-6">
                   {isApplied && <CheckCircle className="h-4 w-4 mr-2" />}
                   {isApplied ? "적용됨" : "적용"}
                 </Button>
               </div>
             </div>
             <p className="text-gray-800 font-mono p-3 bg-gray-100 rounded-lg text-center text-sm">
               CAT activity = (<span className="text-blue-600 font-bold">Measured ΔA (240 nm)</span> × <HighlightedValue value={params.cat?.total_vol} placeholder="total_vol"/> × 1000) / (43.6 × <HighlightedValue value={params.cat?.enzyme_vol} placeholder="enzyme_vol"/>) / <HighlightedValue value={params.cat?.enzyme_conc} placeholder="enzyme_conc"/>
             </p>
           </div>
         );

      // 3. POD (Peroxidase) 분리
      case "pod":
        return (
           <div className="flex flex-col space-y-4">
             <div className="flex flex-wrap items-end gap-4">
               <div className="flex-1 min-w-[120px]">
                 <ParamInput label="Total Volume (μL)" value={params.pod?.total_vol || ""} onChange={e => handleNestedParamChange('pod', 'total_vol', e.target.value)} placeholder="e.g., 200" />
               </div>
               {/* POD는 20uL 권장 (프로토콜 기준) */}
               <div className="flex-1 min-w-[120px]">
                 <ParamInput label="Enzyme Volume (μL)" value={params.pod?.enzyme_vol || ""} onChange={e => handleNestedParamChange('pod', 'enzyme_vol', e.target.value)} placeholder="e.g., 20" />
               </div>
               <div className="flex-1 min-w-[150px]">
                 <ParamInput label="Enzyme Conc. (mg/mL)" value={params.pod?.enzyme_conc || ""} onChange={e => handleNestedParamChange('pod', 'enzyme_conc', e.target.value)} placeholder="e.g., 10" />
               </div>
               <div className="flex-shrink-0">
                 <Button onClick={handleApply} className="ios-button rounded-xl h-12 flex items-center justify-center px-6">
                   {isApplied && <CheckCircle className="h-4 w-4 mr-2" />}
                   {isApplied ? "적용됨" : "적용"}
                 </Button>
               </div>
             </div>
             <p className="text-gray-800 font-mono p-3 bg-gray-100 rounded-lg text-center text-sm">
               POD activity = (<span className="text-blue-600 font-bold">Measured ΔA (470 nm)</span> × <HighlightedValue value={params.pod?.total_vol} placeholder="total_vol"/> × 1000) / (26.6 × <HighlightedValue value={params.pod?.enzyme_vol} placeholder="enzyme_vol"/>) / <HighlightedValue value={params.pod?.enzyme_conc} placeholder="enzyme_conc"/>
             </p>
           </div>
         );

      default:
        return null;
    }
  };

  const renderedParams = renderParams();
  if (!renderedParams) return null;

  return (
    <Card className="ios-card ios-blur rounded-3xl ios-shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-900 text-xl font-semibold">
          <Calculator className="h-5 w-5" />
          <span>계산 변수 입력</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderedParams}
      </CardContent>
    </Card>
  );
}
