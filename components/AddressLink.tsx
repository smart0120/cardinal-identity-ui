import { formatShortAddress } from "@cardinal/namespaces-components";
import styled from "@emotion/styled";
import type { PublicKey } from "@solana/web3.js";
import { notify } from "common/Notification";
import copy from "copy-to-clipboard";
import { useEnvironmentCtx } from "providers/EnvironmentProvider";
import React from "react";
import { FaRegCopy } from "react-icons/fa";
import tw from "twin.macro";

interface Props {
  address: PublicKey;
  className?: string;
  showCopy?: boolean;
  children?: React.ReactNode;
  showRaw?: boolean;
  shorten?: boolean;
}

export const AddressLink: React.FC<Props> = ({
  address,
  className,
  shorten = true,
  showCopy = false,
  showRaw = true,
  children,
}: Props) => {
  const { environment } = useEnvironmentCtx();
  return (
    <Wrapper>
      <StyledA
        className={className}
        href={`https://explorer.solana.com/address/${address.toString()}?cluster=${
          environment.label === "devnet" ? "devnet" : ""
        }`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children ??
          (showRaw
            ? shorten
              ? formatShortAddress(address)
              : address.toString()
            : formatShortAddress(address))}
      </StyledA>
      {showCopy && (
        <CopyIcon
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            copy(address.toString());
            notify({ message: "Copied address to clipboard." });
          }}
        />
      )}
    </Wrapper>
  );
};

const StyledA = styled.a``;

const Wrapper = styled.div`
  ${tw`inline-flex items-center`}
  margin: 0px auto;
  a {
    font-size: 14px;
    color: rgb(101, 119, 134);
    text-decoration: none;
    transition: 0.2s all;
    &:hover {
      opacity: 0.7;
    }
  }
`;

const CopyIcon = styled(FaRegCopy)`
  ${tw`ml-1 cursor-pointer text-gray-800 dark:text-warmGray-200 hover:text-primary`}
`;
