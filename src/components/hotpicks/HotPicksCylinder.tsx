import React, { useEffect, useRef, useState } from "react";
import styles from "./HotPicksCylinder.module.css";

interface HotPickItem {
    id: string | number;
    title: string;
    dateText: string;
    venue: string;
    imageUrl: string;
}

interface Props {
    items: HotPickItem[];
}

const HotPicksCylinder: React.FC<Props> = ({ items }) => {
    // 연속적인 가상 인덱스(실수). 1 증가 = 한 칸 이동
    const [phase, setPhase] = useState(0);
    const phaseRef = useRef(0);
    const isAnimatingRef = useRef(false);
    const frameIdRef = useRef<number | null>(null);
    const autoplayTimeoutRef = useRef<number | null>(null);

    const animationDurationMs = 600; // 더 직선적이고 짧게
    const autoplayDelayMs = 3000;

    const n = Math.max(1, items.length);
    const totalVisible = 7; // 고정 슬롯 수
    const center = Math.floor(totalVisible / 2);

    // 원통 매개변수
    const cylinderRadius = 500;
    const posterWidth = 260;
    const angleStep = posterWidth / cylinderRadius; // 라디안

    // 선형 이동으로 튕김 느낌 제거
    const ease = (t: number) => t;

    const getPosterTransformByOffset = (offset: number): React.CSSProperties => {
        const angle = offset * angleStep;
        const translateX = Math.sin(angle) * cylinderRadius;
        const translateZ = cylinderRadius - Math.cos(angle) * cylinderRadius;
        const rotateY = -angle * (180 / Math.PI);

        const opacity = Math.max(0.6, 1 - Math.abs(offset) * 0.08);
        const brightness = Math.max(0.8, 1 - Math.abs(offset) * 0.1);

        return {
            transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
            opacity,
            filter: `brightness(${brightness})`,
            zIndex: Math.round(10 - Math.abs(translateZ / 10)),
        };
    };

    const clearAutoplay = () => {
        if (autoplayTimeoutRef.current !== null) {
            window.clearTimeout(autoplayTimeoutRef.current);
            autoplayTimeoutRef.current = null;
        }
    };

    const startSlide = (direction: 1 | -1) => {
        if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;
        clearAutoplay();

        const start = performance.now();
        const startPhase = phaseRef.current;
        const targetPhase = startPhase + direction;

        const step = () => {
            const now = performance.now();
            const t = Math.min(1, (now - start) / animationDurationMs);
            const eased = ease(t);
            const value = startPhase + direction * eased;
            phaseRef.current = value;
            setPhase(value);

            if (t < 1) {
                frameIdRef.current = requestAnimationFrame(step);
            } else {
                // 정확히 목표 지점으로 스냅
                phaseRef.current = targetPhase;
                setPhase(targetPhase);
                isAnimatingRef.current = false;
                scheduleAutoplay();
            }
        };

        frameIdRef.current = requestAnimationFrame(step);
    };

    const scheduleAutoplay = () => {
        clearAutoplay();
        autoplayTimeoutRef.current = window.setTimeout(() => startSlide(1), autoplayDelayMs);
    };

    useEffect(() => {
        scheduleAutoplay();
        return () => {
            clearAutoplay();
            if (frameIdRef.current !== null) cancelAnimationFrame(frameIdRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [n]);

    // base/frac으로 연속 슬라이드 보간 (끊김 없음)
    const base = Math.floor(phase);
    const frac = phase - base; // 0..1

    const slotStart = -center - 1; // 가장자리 보강
    const slotEnd = center + 1;

    return (
        <div className={styles.wrapper}>
            <div className={styles.cylinder}>
                {Array.from({ length: slotEnd - slotStart + 1 }).map((_, idx) => {
                    const s = slotStart + idx; // 정수 슬롯 위치
                    const item = items[((base + s) % n + n) % n]; // 모듈로(음수 보정)
                    const effectiveOffset = s - frac; // 연속 오프셋
                    const style = getPosterTransformByOffset(effectiveOffset);
                    return (
                        <div key={`${item.id}-${s}`} className={styles.panel} style={style}>
                            <img src={item.imageUrl} alt={item.title} />
                            <div className={styles.meta}>
                                <h3>{item.title}</h3>
                                <p>{item.dateText}</p>
                                <p>{item.venue}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HotPicksCylinder;
