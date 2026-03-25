import type {Grade} from "../types.ts";

export const getGrade = ({sys, dia}: { sys: number, dia: number }): Grade => {

  switch (true) {
    case (160 <= sys || 100 <= dia):
      return 'grade-2'
    case (140 <= sys || 90 <= dia):
      return 'grade-1'
    case (130 <= sys || 85 <= dia):
      return 'high-normal'
    case (120 <= sys || 80 <= dia):
      return 'normal'
    case (90 <= sys || 60 <= dia):
      return 'low'
    default:
      return 'out'
  }
}