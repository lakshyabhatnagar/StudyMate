"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function HeroSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="full-course" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="full-course">Full Course</SelectItem>
        <SelectItem value="quick-explain-video">
          Quick Explanation Video
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
