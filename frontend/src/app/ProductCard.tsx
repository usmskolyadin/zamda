import Link from "next/link";

type ProductCardProps = {
  title: string;
  price: string;
  oldPrice?: string;
  location: string;
  image: string;
};

export default function ProductCard({ title, price, oldPrice, location, image }: ProductCardProps) {
  return (
    <Link href={"/vehicles/new-cars/mustang"}>
    <div className="bg-white rounded-2xl w-full">
      <img src={image} alt={title} className="w-full h-[250px] object-cover rounded-2xl mb-2" />
      <div className="p-4 flex-col items-center justify-center">
        <h3 className="font-semibold text-2xl text-center mb-1 text-[#2AAEF7]">{title}</h3>
        <div className="mt-4 flex items-center justify-center space-x-2 mb-1">
            <span className="text-black font-semibold text-xl">{price}</span>
            {oldPrice && <span className="text-gray-400 line-through text-md">{oldPrice}</span>}
        </div>
        <p className="mt-4 flex text-gray-500 text-md text-center justify-center">            
            <svg className="mr-1" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g opacity="0.5">
                    <path d="M20 10C20 14.4183 12 22 12 22C12 22 4 14.4183 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10Z" stroke="black" strokeWidth="2"/>
                    <path d="M12 11C12.5523 11 13 10.5523 13 10C13 9.44772 12.5523 9 12 9C11.4477 9 11 9.44772 11 10C11 10.5523 11.4477 11 12 11Z" fill="black" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
            </svg>
            {location}
        </p>
      </div>
    </div>
    </Link>
  );
}