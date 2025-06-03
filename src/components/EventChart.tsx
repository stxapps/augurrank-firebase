'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import {
  AreaSeries, createChart, DeepPartial, TimeChartOptions,
} from 'lightweight-charts';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

import { useSelector, useDispatch } from '@/store';
import { fetchEventChanges } from '@/actions/common';
import { SCALE } from '@/types/const';
import { getEventWthSts } from '@/selectors';
import { isFldStr } from '@/utils';

export function EventChart() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const evt = useSelector(state => getEventWthSts(state, slug));
  const [ocId, setOcId] = useState(0);
  const chartRef = useRef(null);
  const dispatch = useDispatch();

  const { fthSts, chgFthSts, chgs } = evt;

  const onSwitchBtnClick = () => {
    let next = 0;
    if (Array.isArray(evt.outcomes)) next = (ocId + 1) % evt.outcomes.length;
    setOcId(next);
  };

  useEffect(() => {
    dispatch(fetchEventChanges(evt.id));
  }, [evt.id, dispatch]);

  useEffect(() => {
    if (chgFthSts !== 1) return;

    const data = [];
    for (const chg of chgs) {
      data.push({
        time: Math.floor(chg.createDate / 1000), value: chg.costs[ocId] / SCALE,
      });
    }

    const handleResize = () => {
      chart.applyOptions({ width: chartRef.current.clientWidth });
    };

    const chartOptions: DeepPartial<TimeChartOptions> = {
      layout: {
        background: { color: 'rgb(15 23 42)' },
        textColor: 'rgb(148 163 184)',
      },
      grid: {
        vertLines: { color: 'rgb(30 41 59)' },
        horzLines: { color: 'rgb(30 41 59)' },
      },
    };
    const chart = createChart(chartRef.current, chartOptions);
    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: ocId % 2 === 0 ? 'rgb(59 130 246)' : 'rgb(239 68 68)',
      topColor: ocId % 2 === 0 ? 'rgb(59 130 246)' : 'rgb(239 68 68)',
      bottomColor: 'rgb(15 23 42)',
    });
    areaSeries.setData(data);
    chart.timeScale().fitContent();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [chgFthSts, chgs, ocId]);

  const renderError = () => {
    return (
      <div className="h-40 bg-slate-700 rounded lg:grow lg:shrink" />
    );
  };

  const renderContent = () => {
    const desc = evt.outcomes[ocId].desc;
    const chance = Math.round((evt.costs[ocId] * 100) / SCALE);

    return (
      <div className="lg:grow lg:shrink">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase text-slate-400 font-medium">{desc}</p>
            <p className={clsx(ocId % 2 === 0 && 'text-blue-400', ocId % 2 === 1 && 'text-red-400')}><span className="text-2xl font-medium">{chance}%</span> <span className="text-xl font-medium">chance</span></p>
          </div>
          <div>
            <button onClick={onSwitchBtnClick} className="p-2 mr-1">
              <ArrowsRightLeftIcon className="size-5 text-slate-400" />
            </button>
          </div>
        </div>
        <div className="h-60">
          <div className="h-full" ref={chartRef} />
        </div>
      </div>
    );
  };

  const renderLoading = () => {
    return (
      <div className="h-40 bg-slate-700 rounded animate-pulse lg:grow lg:shrink" />
    );
  };

  let content;
  if (fthSts === 2) { // show error
    content = renderError();
  } else if (fthSts === 1) {
    if (isFldStr(evt.id)) {
      if (chgFthSts === 2) {
        content = renderError();
      } else if (chgFthSts === 1) { // show content
        content = renderContent();
      } else {
        content = renderLoading();
      }
    } else { // not found
      content = (
        <div className="h-40 bg-slate-700 rounded lg:grow lg:shrink" />
      );
    }
  } else { // show loading
    content = renderLoading();
  }

  return content;
}
