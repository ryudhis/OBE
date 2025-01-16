import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";

const searchSchema = z.object({
  searchQuery: z.string(),
});

type SearchFormValues = z.infer<typeof searchSchema>;

export const SearchInput = ({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) => {
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      searchQuery: "",
    },
  });

  const onSubmit = (values: SearchFormValues) => {
    onSearch(values.searchQuery);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-center gap-4"
      >
        <FormField
          control={form.control}
          name="searchQuery"
          render={({ field }) => (
            <FormItem>
              <Input className="w-[150px]" placeholder="Cari" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Cari</Button>
      </form>
    </Form>
  );
};
