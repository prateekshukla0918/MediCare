import { Server as SocketIOServer, Socket } from 'socket.io';

export function setupSocketIO(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected to Socket.IO: ${socket.id}`);

    // Subscribe to personal notification room
    socket.on('subscribe_user', (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} subscribed to notifications`);
      }
    });

    // WebRTC & Consultation Room logic
    socket.on('join_consultation', ({ consultationId, role, name }: { consultationId: string; role: string; name: string }) => {
      const room = `consultation:${consultationId}`;
      socket.join(room);
      console.log(`User ${name} (${role}) joined consultation room: ${room}`);

      // Notify others in room
      socket.to(room).emit('peer_joined', { socketId: socket.id, role, name });
    });

    // Forward WebRTC SDP Offer
    socket.on('webrtc_offer', ({ consultationId, offer }: { consultationId: string; offer: any }) => {
      const room = `consultation:${consultationId}`;
      socket.to(room).emit('webrtc_offer', { offer, senderId: socket.id });
    });

    // Forward WebRTC SDP Answer
    socket.on('webrtc_answer', ({ consultationId, answer }: { consultationId: string; answer: any }) => {
      const room = `consultation:${consultationId}`;
      socket.to(room).emit('webrtc_answer', { answer, senderId: socket.id });
    });

    // Forward WebRTC ICE Candidate
    socket.on('webrtc_ice_candidate', ({ consultationId, candidate }: { consultationId: string; candidate: any }) => {
      const room = `consultation:${consultationId}`;
      socket.to(room).emit('webrtc_ice_candidate', { candidate, senderId: socket.id });
    });

    // Live In-Call Consultation Chat
    socket.on('consultation_chat', ({ consultationId, message }: { consultationId: string; message: any }) => {
      const room = `consultation:${consultationId}`;
      io.to(room).emit('consultation_chat', message);
    });

    // Participant toggled audio/video state
    socket.on('media_state_change', ({ consultationId, isAudioMuted, isVideoOff }: any) => {
      const room = `consultation:${consultationId}`;
      socket.to(room).emit('peer_media_state', { isAudioMuted, isVideoOff, senderId: socket.id });
    });

    // Leave Consultation
    socket.on('leave_consultation', ({ consultationId, name }: { consultationId: string; name: string }) => {
      const room = `consultation:${consultationId}`;
      socket.leave(room);
      socket.to(room).emit('peer_left', { socketId: socket.id, name });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
}
