'use client';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import React, { useState, useEffect } from 'react';
import axiosConfig from '../../../../utils/axios';
import SkeletonTable from '@/components/SkeletonTable';

export interface cpl {
	kode: string;
	deskripsi: string;
	keterangan: string;
}

const DataCPL = () => {
	const [CPL, setCPL] = useState<cpl[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const getCPL = async () => {
		setIsLoading(true);
		try {
			const response = await axiosConfig.get('api/cpl');
			if (response.data.status !== 400) {
			} else {
				alert(response.data.message);
			}
			setCPL(response.data.data);
			console.log(response.data.data);
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};
	useEffect(() => {
		getCPL();
	}, []);
	// id, kode, deskripsi

	const renderData = () => {
		return CPL.map((cpl, index) => {
			return (
				<TableRow key={index}>
					<TableCell>{cpl.kode}</TableCell>
					<TableCell>{cpl.deskripsi}</TableCell>
					<TableCell>{cpl.keterangan}</TableCell>
				</TableRow>
			);
		});
	};

	return (
		<section className='flex justify-center items-center mt-20'>
			<Card className='w-[1000px]'>
				<CardHeader>
					<CardTitle>Tabel CPL</CardTitle>
					<CardDescription>Capaian Pembelajaran</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className='w-[100px]'>Kode</TableHead>
									<TableHead>Deskripsi</TableHead>
									<TableHead>Keterangan</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<SkeletonTable rows={5} cols={4} />
							</TableBody>
						</Table>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className='w-[100px]'>Kode</TableHead>
									<TableHead>Deskripsi</TableHead>
									<TableHead>Keterangan</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>{renderData()}</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</section>
	);
};

export default DataCPL;
