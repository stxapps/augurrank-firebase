'use client';
import { useParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import {
  AreaSeries, createChart, DeepPartial, TimeChartOptions, ColorType,
} from 'lightweight-charts';

import { useSelector, useDispatch } from '@/store';
import { fetchEventChanges } from '@/actions/common';
import { getEventWthSts } from '@/selectors';
import { isFldStr } from '@/utils';

export function EventChart() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const {
    fthSts, id, chgFthSts, chgs,
  } = useSelector(state => getEventWthSts(state, slug));
  const chartRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchEventChanges(id));
  }, [id]);

  useEffect(() => {
    if (chgFthSts !== 1) return;

    const handleResize = () => {
      chart.applyOptions({ width: chartRef.current.clientWidth });
    };

    const chartOptions: DeepPartial<TimeChartOptions> = {
      layout: {
        background: { type: ColorType.Solid, color: '#0f172b' },
        textColor: '#e2e8f0',
      },
    };
    const chart = createChart(chartRef.current, chartOptions);
    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#2b7fff',
      topColor: '#2b7fff',
      bottomColor: '#bedbff',
    });
    areaSeries.setData(chgs);
    chart.timeScale().fitContent();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [chgFthSts, chgs]);

  let content;
  if (fthSts === 2) { // show error

  } else if (fthSts === 1) {
    if (isFldStr(id)) {
      if (chgFthSts === 2) {

      } else if (chgFthSts === 1) { // show content
        content = (
          <div className="h-60 lg:grow lg:shrink">
            <div className="h-full" ref={chartRef} />
          </div>
        );
      } else {

      }
    } else { // not found

    }
  } else { // show loading

  }

  return content;
}
