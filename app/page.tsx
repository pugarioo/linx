import LinkInput from '@/components/ui/LinkInput'
import Navbar from '@/components/ui/Navbar';
import { Bitcount_Grid_Single } from 'next/font/google';

const bitFont = Bitcount_Grid_Single({
	weight: "400"
})

export default function Home() {
	return (
		<div className={bitFont.className}>


			<div className="absolute top-0 z-[-2] h-screen w-screen bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-size-[20px_20px]"></div>

			<Navbar />
			<main className='min-h-screen flex flex-col justify-center items-center px-4 py-8'>

				<div className="flex justify-center flex-col items-center text-white text-center">
					<p className='text-4xl sm:text-5xl md:text-6xl my-4'>
						<span className='text-blue-700'>Linx:</span> Short links, Big impact.
					</p>
					<p className='my-4 text-lg sm:text-xl'>Shorten. Share. Succeed.</p>
				</div>


				<LinkInput /> {/* Assumes LinkInput component is now responsive */}


				<div className='text-white py-4 w-full max-w-2xl flex flex-col justify-center items-center gap-4'>
					<p className='text-center'><q>Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.</q></p>
					<p className='self-end text-gray-500'>— Antoine de Saint-Exupéry</p>
				</div>
			</main>
		</div>
	);

}