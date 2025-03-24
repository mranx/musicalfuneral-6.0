import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import CustomAudioPlayer from "./CustomAudioPlayer";
export type SelectionType = {
  value: string;
  name: string;
  audioUrl?: string;
};
function SelectField({ fieldName, label, options, control }: any) {
  return (
    <FormField
      control={control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="font-semibold">{label}</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="w-full bg-[#F8F8F8] border-[#F8F8F8] dark:bg-[#111423] dark:outline-0 dark:border-0 py-2.5 px-4 focus:border-0 focus:ring-0">
                {field.value || "-- Select --"}
              </SelectTrigger>
              <SelectContent className="dark:bg-[#111423]">
                {options.map((option: SelectionType,index:number) =>
                  option.audioUrl ? (
                    <div key={index}
                      className={`flex items-center justify-between gap-2 px-1 py-2  rounded ${
                        field.value === option.value
                          ? "bg-[#101d3b]"
                          : "hover:bg-[#27272a]"
                      }`}
                    >
                      <button
                        className="flex-1 text-left  "
                        onClick={() => {
                          field.onChange(option.value);
                        }}
                      >
                        {option.name}
                      </button>
                      <CustomAudioPlayer audioUrl={option.audioUrl} />
                    </div>
                  ) : (
                    <SelectItem key={option.value} value={option.value}>
                      {option.name}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default SelectField;
