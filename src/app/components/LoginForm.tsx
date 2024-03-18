'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosConfig from '../../utils/axios';
import Cookies from 'js-cookie';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/components/ui/use-toast';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
	email: z.string().min(10).max(50),
	password: z.string().min(6).max(50),
});

const LoginForm = () => {
	const { toast } = useToast();
	const router = useRouter();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const signIn = (values: z.infer<typeof formSchema>, e: any) => {
		e.preventDefault();

		const data = {
			email: values.email,
			password: values.password,
		};

		axiosConfig
			.post('api/login', data)
			.then(function (response: any) {
				if (response.data.status != 400) {
					Cookies.set('token', response.data.token, { expires: 1 });
					toast({
						title: 'Berhasil Login',
						description: String(new Date()),
					});
					router.push('/dashboard');
				} else {
					toast({
						title: response.data.message,
						description: String(new Date()),
						variant: 'destructive',
					});
				}
			})
			.catch(function (error: any) {
				toast({
					title: 'Gagal Login',
					description: String(new Date()),
					variant: 'destructive',
				});
			});
		form.reset();
	};

	return (
		// FORM LOGIN
		<Card className='w-[400px] xl:w-[500px]'>
			<CardHeader>
				<CardTitle>Login</CardTitle>
				<CardDescription>OBE</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(signIn)} className='space-y-8'>
						<FormField
							control={form.control}
							name='email'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											placeholder='email@itera.ac.id'
											type='email'
											required
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='password'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input
											placeholder='&bull;&bull;&bull;&bull;&bull;&bull;'
											type='password'
											required
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button
							className='bg-azure-radiance-600 hover:bg-azure-radiance-500 active:bg-azure-radiance-700 w-full'
							type='submit'>
							Login
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
};

export default LoginForm;
