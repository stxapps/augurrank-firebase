'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import {
  UserIcon, ChevronRightIcon, ChevronLeftIcon, XCircleIcon, PhotoIcon,
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';

import { useSelector, useDispatch } from '@/store';
import {
  fetchAvlbUsns, fetchAvlbAvts, fetchAvlbAvtsMore, updateProfileEditor,
  updateProfileData,
} from '@/actions/profile';
import { dialogBgFMV, dialogFMV } from '@/types/animConfigs';
import {
  getPflEdtrAvtWthObj, getAvlbAvtsWthObj, getAvlbAvtsHasMore,
} from '@/selectors';
import { isString, isFldStr, getAvtThbnl } from '@/utils';

import { useSafeAreaFrame } from '.';
import LogoBns from '../images/logo-bns.png';

const mdlFMV = {
  hidden: {
    translateX: '-20%',
    transition: { ease: 'easeOut', duration: 0.2 },
  },
  visible: {
    translateX: '0%',
    transition: { ease: 'easeIn', duration: 0.2 },
  },
};

const rgtOtrFMV = {
  hidden: {
    transition: { when: 'afterChildren' },
    visibility: 'hidden',
  },
  visible: {
    visibility: 'visible',
  },
};

const rgtInrFMV = {
  hidden: {
    translateX: '100%',
    transition: { ease: 'easeIn', duration: 0.2 },
  },
  visible: {
    translateX: '0%',
    transition: { ease: 'easeOut', duration: 0.2 },
  },
};

export function ProfileEditorPopup() {

}
