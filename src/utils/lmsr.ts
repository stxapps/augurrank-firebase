const u = (x) => {
  return BigInt(x);
};

const SCALE = u('1000000');

// ---------------------------------------------------------
// LMSR
// ---------------------------------------------------------

const getSumExp = (qqbs) => {
  let sum = u('0');
  for (const qqb of qqbs) {
    sum += exp(qqb.qb);
  }
  return sum;
};

const getShareCost = (sumExp, qqb) => {
  const expQkb = exp(qqb.qb);
  return (expQkb * SCALE) / sumExp;
};

// ---------------------------------------------------------
// Read helpers
// ---------------------------------------------------------

const getQqbs = (beta, outcomes) => {
  return outcomes.map(oc => {
    const id = oc.id;
    const q = u(oc.shareAmount);
    const qb = (q * SCALE) / beta;
    return { id, q, qb };
  });
};

export const getShareCosts = (evt) => {
  const beta = u(evt.beta);
  const qqbs = getQqbs(beta, evt.outcomes);
  const sumExp = getSumExp(qqbs);
  const costs = qqbs.map(qqb => getShareCost(sumExp, qqb));
  const norms = costs.map(cost => Number(cost));
  return norms;
};

// ---------------------------------------------------------
// Exponential
// ---------------------------------------------------------

const expLookup = (x: bigint) => {
  if (x === u('0')) return u('1000000');
  if (x === u('500000')) return u('1648721');
  if (x === u('1000000')) return u('2718281');
  if (x === u('1500000')) return u('4481689');
  if (x === u('2000000')) return u('7389056');
  if (x === u('2500000')) return u('12182493');
  if (x === u('3000000')) return u('20085536');
  if (x === u('3500000')) return u('33115451');
  if (x === u('4000000')) return u('54598150');
  if (x === u('4500000')) return u('90017131');
  if (x === u('5000000')) return u('148413159');
  if (x === u('6000000')) return u('403428793');
  if (x === u('7000000')) return u('1096633158');
  if (x === u('8000000')) return u('2980957987');
  if (x === u('9000000')) return u('8103083927');
  if (x === u('10000000')) return u('22026465794');
  if (x === u('11000000')) return u('59874141715');
  if (x === u('12000000')) return u('162754791419');
  if (x === u('13000000')) return u('442413392008');
  if (x === u('14000000')) return u('1202604284164');
  if (x === u('15000000')) return u('3269017372472');
  if (x === u('16000000')) return u('8886110520507');
  if (x === u('17000000')) return u('24154952753575');
  if (x === u('18000000')) return u('65659969137330');
  if (x === u('19000000')) return u('178482300963187');
  if (x === u('20000000')) return u('485165195409790');
  if (x === u('21000000')) return u('1318815734483214');
  if (x === u('22000000')) return u('3584912846131592');
  if (x === u('23000000')) return u('9744803446248903');
  if (x === u('24000000')) return u('26489122129843470');
  if (x === u('25000000')) return u('72004899337385880');
  if (x === u('25500000')) return u('118716009132169650');
  if (x === u('26000000')) return u('195729609428838780');
  if (x === u('26500000')) return u('322703570371154850');
  if (x === u('27000000')) return u('532048240601798650');
  if (x === u('27500000')) return u('877199251318764900');
  if (x === u('28000000')) return u('1446257064291475000');
  if (x === u('28500000')) return u('2384474784797677700');
  if (x === u('29000000')) return u('3931334297144042000');
  if (x === u('29500000')) return u('6481674477934320000');
  if (x === u('30000000')) return u('10686474581524463000');
  throw new Error(`In expLookup, invalid x: ${x}`);
};

const getExpLower = (x: bigint) => {
  if (x >= u('30000000')) return u('30000000');
  if (x >= u('29500000')) return u('29500000');
  if (x >= u('29000000')) return u('29000000');
  if (x >= u('28500000')) return u('28500000');
  if (x >= u('28000000')) return u('28000000');
  if (x >= u('27500000')) return u('27500000');
  if (x >= u('27000000')) return u('27000000');
  if (x >= u('26500000')) return u('26500000');
  if (x >= u('26000000')) return u('26000000');
  if (x >= u('25500000')) return u('25500000');
  if (x >= u('25000000')) return u('25000000');
  if (x >= u('24000000')) return u('24000000');
  if (x >= u('23000000')) return u('23000000');
  if (x >= u('22000000')) return u('22000000');
  if (x >= u('21000000')) return u('21000000');
  if (x >= u('20000000')) return u('20000000');
  if (x >= u('19000000')) return u('19000000');
  if (x >= u('18000000')) return u('18000000');
  if (x >= u('17000000')) return u('17000000');
  if (x >= u('16000000')) return u('16000000');
  return getExpLowerLower(x);
};
const getExpLowerLower = (x: bigint) => {
  if (x >= u('15000000')) return u('15000000');
  if (x >= u('14000000')) return u('14000000');
  if (x >= u('13000000')) return u('13000000');
  if (x >= u('12000000')) return u('12000000');
  if (x >= u('11000000')) return u('11000000');
  if (x >= u('10000000')) return u('10000000');
  if (x >= u('9000000')) return u('9000000');
  if (x >= u('8000000')) return u('8000000');
  if (x >= u('7000000')) return u('7000000');
  if (x >= u('6000000')) return u('6000000');
  if (x >= u('5000000')) return u('5000000');
  if (x >= u('4500000')) return u('4500000');
  if (x >= u('4000000')) return u('4000000');
  if (x >= u('3500000')) return u('3500000');
  if (x >= u('3000000')) return u('3000000');
  if (x >= u('2500000')) return u('2500000');
  if (x >= u('2000000')) return u('2000000');
  if (x >= u('1500000')) return u('1500000');
  if (x >= u('1000000')) return u('1000000');
  if (x >= u('500000')) return u('500000');
  return u('0');
};

const getExpUpper = (x: bigint) => {
  if (x <= u('0')) return u('0');
  if (x <= u('500000')) return u('500000');
  if (x <= u('1000000')) return u('1000000');
  if (x <= u('1500000')) return u('1500000');
  if (x <= u('2000000')) return u('2000000');
  if (x <= u('2500000')) return u('2500000');
  if (x <= u('3000000')) return u('3000000');
  if (x <= u('3500000')) return u('3500000');
  if (x <= u('4000000')) return u('4000000');
  if (x <= u('4500000')) return u('4500000');
  if (x <= u('5000000')) return u('5000000');
  if (x <= u('6000000')) return u('6000000');
  if (x <= u('7000000')) return u('7000000');
  if (x <= u('8000000')) return u('8000000');
  if (x <= u('9000000')) return u('9000000');
  if (x <= u('10000000')) return u('10000000');
  if (x <= u('11000000')) return u('11000000');
  if (x <= u('12000000')) return u('12000000');
  if (x <= u('13000000')) return u('13000000');
  if (x <= u('14000000')) return u('14000000');
  return getExpUpperUpper(x);
};
const getExpUpperUpper = (x: bigint) => {
  if (x <= u('15000000')) return u('15000000');
  if (x <= u('16000000')) return u('16000000');
  if (x <= u('17000000')) return u('17000000');
  if (x <= u('18000000')) return u('18000000');
  if (x <= u('19000000')) return u('19000000');
  if (x <= u('20000000')) return u('20000000');
  if (x <= u('21000000')) return u('21000000');
  if (x <= u('22000000')) return u('22000000');
  if (x <= u('23000000')) return u('23000000');
  if (x <= u('24000000')) return u('24000000');
  if (x <= u('25000000')) return u('25000000');
  if (x <= u('25500000')) return u('25500000');
  if (x <= u('26000000')) return u('26000000');
  if (x <= u('26500000')) return u('26500000');
  if (x <= u('27000000')) return u('27000000');
  if (x <= u('27500000')) return u('27500000');
  if (x <= u('28000000')) return u('28000000');
  if (x <= u('28500000')) return u('28500000');
  if (x <= u('29000000')) return u('29000000');
  if (x <= u('29500000')) return u('29500000');
  return u('30000000');
};

const exp = (x: bigint) => {
  const lowerX = getExpLower(x);
  const upperX = getExpUpper(x);
  const lowerVal = expLookup(lowerX);
  const upperVal = expLookup(upperX);
  const diffX = upperX - lowerX;

  let val = u('0');
  if (diffX > 0) val = ((upperVal - lowerVal) * (x - lowerX)) / diffX;

  return lowerVal + val;
};

// ---------------------------------------------------------
// Natural logarithm
// ---------------------------------------------------------

const lnLookup = (x: bigint) => {
  if (x === u('1000000')) return u('0');
  if (x === u('1612800')) return u('477971');
  if (x === u('2532000')) return u('929009');
  if (x === u('4083200')) return u('1406880');
  if (x === u('6410000')) return u('1857859');
  if (x === u('10334000')) return u('2335439');
  if (x === u('16220000')) return u('2786245');
  if (x === u('26159616')) return u('3264216');
  if (x === u('41069040')) return u('3715254');
  if (x === u('66236147')) return u('4193226');
  if (x === u('103986809')) return u('4644264');
  if (x === u('263294601')) return u('5573273');
  if (x === u('666661929')) return u('6502283');
  if (x === u('1687988006')) return u('7431292');
  if (x === u('4273985632')) return u('8360302');
  if (x === u('10821731622')) return u('9289311');
  if (x === u('27400624468')) return u('10218321');
  if (x === u('69378381154')) return u('11147330');
  if (x === u('175803743074')) return u('12077123');
  if (x === u('445135077462')) return u('13006133');
  if (x === u('1127082016130')) return u('13935142');
  if (x === u('2853771664850')) return u('14864152');
  if (x === u('7225749855410')) return u('15793161');
  if (x === u('18295598633900')) return u('16722171');
  if (x === u('46324455741000')) return u('17651180');
  if (x === u('117293521936000')) return u('18580190');
  if (x === u('296987197543000')) return u('19509199');
  if (x === u('751971584178000')) return u('20438209');
  if (x === u('1903992051140000')) return u('21367218');
  if (x === u('4820907873480000')) return u('22296228');
  if (x === u('12206538735700000')) return u('23225237');
  if (x === u('30906956078700000')) return u('24154247');
  if (x === u('78256412791200000')) return u('25083256');
  if (x === u('198145237187000000')) return u('26012266');
  if (x === u('501703740558000000')) return u('26941275');
  throw new Error(`In lnLookup, invalid x: ${x}`);
};

const getLnLower = (x: bigint) => {
  if (x >= u('501703740558000000')) return u('501703740558000000');
  if (x >= u('198145237187000000')) return u('198145237187000000');
  if (x >= u('78256412791200000')) return u('78256412791200000');
  if (x >= u('30906956078700000')) return u('30906956078700000');
  if (x >= u('12206538735700000')) return u('12206538735700000');
  if (x >= u('4820907873480000')) return u('4820907873480000');
  if (x >= u('1903992051140000')) return u('1903992051140000');
  if (x >= u('751971584178000')) return u('751971584178000');
  if (x >= u('296987197543000')) return u('296987197543000');
  if (x >= u('117293521936000')) return u('117293521936000');
  if (x >= u('46324455741000')) return u('46324455741000');
  if (x >= u('18295598633900')) return u('18295598633900');
  if (x >= u('7225749855410')) return u('7225749855410');
  if (x >= u('2853771664850')) return u('2853771664850');
  if (x >= u('1127082016130')) return u('1127082016130');
  if (x >= u('445135077462')) return u('445135077462');
  if (x >= u('175803743074')) return u('175803743074');
  if (x >= u('69378381154')) return u('69378381154');
  if (x >= u('27400624468')) return u('27400624468');
  if (x >= u('10821731622')) return u('10821731622');
  if (x >= u('4273985632')) return u('4273985632');
  if (x >= u('1687988006')) return u('1687988006');
  if (x >= u('666661929')) return u('666661929');
  if (x >= u('263294601')) return u('263294601');
  if (x >= u('103986809')) return u('103986809');
  if (x >= u('66236147')) return u('66236147');
  if (x >= u('41069040')) return u('41069040');
  if (x >= u('26159616')) return u('26159616');
  if (x >= u('16220000')) return u('16220000');
  if (x >= u('10334000')) return u('10334000');
  if (x >= u('6410000')) return u('6410000');
  if (x >= u('4083200')) return u('4083200');
  if (x >= u('2532000')) return u('2532000');
  if (x >= u('1612800')) return u('1612800');
  return u('1000000');
};

const getLnUpper = (x: bigint) => {
  if (x <= u('1000000')) return u('1000000');
  if (x <= u('1612800')) return u('1612800');
  if (x <= u('2532000')) return u('2532000');
  if (x <= u('4083200')) return u('4083200');
  if (x <= u('6410000')) return u('6410000');
  if (x <= u('10334000')) return u('10334000');
  if (x <= u('16220000')) return u('16220000');
  if (x <= u('26159616')) return u('26159616');
  if (x <= u('41069040')) return u('41069040');
  if (x <= u('66236147')) return u('66236147');
  if (x <= u('103986809')) return u('103986809');
  if (x <= u('263294601')) return u('263294601');
  if (x <= u('666661929')) return u('666661929');
  if (x <= u('1687988006')) return u('1687988006');
  if (x <= u('4273985632')) return u('4273985632');
  if (x <= u('10821731622')) return u('10821731622');
  if (x <= u('27400624468')) return u('27400624468');
  if (x <= u('69378381154')) return u('69378381154');
  if (x <= u('175803743074')) return u('175803743074');
  if (x <= u('445135077462')) return u('445135077462');
  if (x <= u('1127082016130')) return u('1127082016130');
  if (x <= u('2853771664850')) return u('2853771664850');
  if (x <= u('7225749855410')) return u('7225749855410');
  if (x <= u('18295598633900')) return u('18295598633900');
  if (x <= u('46324455741000')) return u('46324455741000');
  if (x <= u('117293521936000')) return u('117293521936000');
  if (x <= u('296987197543000')) return u('296987197543000');
  if (x <= u('751971584178000')) return u('751971584178000');
  if (x <= u('1903992051140000')) return u('1903992051140000');
  if (x <= u('4820907873480000')) return u('4820907873480000');
  if (x <= u('12206538735700000')) return u('12206538735700000');
  if (x <= u('30906956078700000')) return u('30906956078700000');
  if (x <= u('78256412791200000')) return u('78256412791200000');
  if (x <= u('198145237187000000')) return u('198145237187000000');
  return u('501703740558000000');
};

const ln = (x: bigint) => {
  const lowerX = getLnLower(x);
  const upperX = getLnUpper(x);
  const lowerVal = lnLookup(lowerX);
  const upperVal = lnLookup(upperX);
  const diffX = upperX - lowerX;

  let val = u('0');
  if (diffX > u('0')) val = ((upperVal - lowerVal) * (x - lowerX)) / diffX;

  return lowerX + val;
};
