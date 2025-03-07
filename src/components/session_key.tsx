

import React, { useState } from 'react'
import { LoadingButton } from "@mui/lab"
import { Card, CardContent, Stack, Typography, Box, Container, Modal } from "@mui/material"
import {
  useCreateSessionKey,
  useCurrentAddress,
  useCurrentNetwork,
} from '@roochnetwork/rooch-sdk-kit'
import { MODULE_ADDRESS } from '../config/constants'
import { styled } from "@mui/material/styles"
import { motion } from "framer-motion"

const StyledCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.9);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
  }
`

// 自定义按钮样式
const StyledButton = styled(LoadingButton)`
  border-radius: 50px;
  padding: 12px 32px;
  font-weight: bold;
  text-transform: none;
  font-size: 1rem;
  transition: transform 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: scale(1.05);
  }
`

export function useSessionKey() {
    const { mutateAsync: createSessionKey } = useCreateSessionKey()
    const network = useCurrentNetwork()
    const addr = useCurrentAddress()
  
    const createSession = async () => {
      try {
        await createSessionKey({
          appName: 'Fate X',
          appUrl: 'https://fatex.zone',
          scopes: [`${MODULE_ADDRESS}::*::*`],
          maxInactiveInterval: 86400, // 1 day
        })
        return true
      } catch (e: any) {
        if (e.code === 1004) {
          const tag = network === 'mainnet' ? '' : 'test-'
          window.open(`https://${tag}portal.rooch.network/faucet/${addr?.toStr()}`)
        }
        console.log(e.code)
        return false
      }
    }
  
    return {
      createSession,
    }
  }


interface CreateSessionKeyProps {
  isOpen: boolean
  onClose: () => void
}
export const CreateSessionKey: React.FC<CreateSessionKeyProps> = ({ isOpen, onClose }) => {
  
    const { createSession } = useSessionKey()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    const handleCreateSession = async () => {
        if (loading) return
        
        setLoading(true)
        try {
          const result = await createSession()
          if (result) {
            onClose()
          } else {
            setError(true)
          }
        } finally {
          setLoading(false)
        }
      }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <StyledCard>
            <CardContent>
              <Typography variant="h5" className="mb-4 font-bold" sx={{ display: 'flex', alignItems: 'center' }}>
                <Box component="span" sx={{ mr: 1, fontSize: '1.5rem' }}>🔐</Box>
                会话密钥
              </Typography>

              <Typography variant="body1" sx={{ mb: 3 }}>
                {error ? '当前 RGas 余额不足' : '创建一个新的会话密钥以继续操作'}
              </Typography>

              <Stack spacing={2} alignItems="center">
                <StyledButton
                  variant="contained"
                  color={error ? "warning" : "primary"}
                  size="large"
                  fullWidth
                  loading={loading}
                  onClick={handleCreateSession}
                  startIcon={<span>{error ? '💰' : '🔑'}</span>}
                >
                  {error ? '获取 RGas' : '创建会话密钥'}
                </StyledButton>
              </Stack>
            </CardContent>
          </StyledCard>
        </motion.div>
      </Container>
    </Modal>
  )
}
