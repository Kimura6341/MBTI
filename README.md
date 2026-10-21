# 人格光谱 · 110题双画像

中文人格探索原型，使用原生HTML、CSS与ES Modules，无运行时依赖。60道原创题和完整50道IPIP Big-Five Factor Markers题混排，共110题、19组，每组6题，末组2题。两套题库独立计分。保留旧版答案，新增题需补答。

## 运行

在本目录执行 `node preview.mjs`，打开 http://127.0.0.1:4173 。验证评分执行 `node --test --test-isolation=none tests/model.test.mjs` 。运行 `node build-offline.mjs` 生成离线版。部署静态目录为 `dist/`。

## 评分边界

原创60题不是16Personalities、NERIS或官方MBTI。每维12题，正反各6题，每题权重1。答案为+3到-3，反向题反转；百分比按 `round(50+50*S/36)` 换算。零分显示X。靠近中点8个百分点的提示阈值是产品约定。

新增IPIP50题采用公有领域的官方英文题库与正反向键，中文为本项目自译，七档为改编格式。答案映射至1到7，正向x、反向8-x；每维10题，总分10至70，均分总分/10，展示量程位置 `round((总分-10)/60*100)`。两套结果不互相混算。展示百分数不是人口百分位、准确率、IQ或临床诊断。中文自译与组合版本未经信效度或本地常模验证。

官方来源：
- https://www.ipip.ori.org/New_IPIP-50-item-scale.htm
- https://ipip.ori.org/newBigFive5broadKey.htm
- https://ipip.ori.org/newPermission.htm

答案只写入本浏览器localStorage。不设置第三方追踪脚本，不将答案传给服务端。

## 原站调查

已确认原站当前可见前6题的选项编码为-3至+3，不能据此认定其题目权重。公开脚本调查记录另见工作区输出；没有将原站代码或题库加入此产品。
