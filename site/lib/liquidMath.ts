// _includes/benchmark/*.html과 benchmarks/history/index.md는 Liquid의 `divided_by`로
// SVG 좌표를 계산한다. Liquid는 두 피연산자가 정수면 정수 나눗셈(버림)을 한다 — 그
// 결과에 의존해 만든 차트라, JS로 옮길 때 일반 float 나눗셈을 쓰면 점 위치가 미묘하게
// 어긋난다. 두 정수를 나누는 자리에서만 이 함수를 쓴다.
export function intDiv(a: number, b: number): number {
  return Math.trunc(a / b);
}
