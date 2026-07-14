import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as interestService from '../../services/interest.service';
import * as messageService from '../../services/message.service';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Send, MessageSquare, User, Smile } from 'lucide-react';

export const ChatPage = () => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [searchParams] = useSearchParams();
  const queryRoomId = searchParams.get('roomId');

  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isPeerTyping, setIsPeerTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load chat rooms based on accepted interest requests
  useEffect(() => {
    const fetchRooms = async () => {
      setLoadingRooms(true);
      try {
        let accepted = [];
        if (user.role === 'TENANT') {
          const sent = await interestService.getSentInterests();
          accepted = sent.filter((i) => i.status === 'ACCEPTED' && i.chatRoom);
        } else {
          const received = await interestService.getReceivedInterests();
          accepted = received.filter((i) => i.status === 'ACCEPTED' && i.chatRoom);
        }
        
        // Map to standard room structure
        const mappedRooms = accepted.map((item) => {
          const peerName = user.role === 'TENANT' 
            ? item.listing?.ownerProfile?.user?.name || 'Owner'
            : item.tenantProfile?.user?.name || 'Tenant';
          const peerId = user.role === 'TENANT'
            ? item.listing?.ownerProfile?.user?.id
            : item.tenantProfile?.user?.id;
          
          return {
            id: item.chatRoom.id,
            peerName,
            peerId,
            listingTitle: item.listing?.title,
          };
        });

        setRooms(mappedRooms);

        // Pre-select room
        if (queryRoomId) {
          const selected = mappedRooms.find((r) => r.id === queryRoomId);
          if (selected) {
            setActiveRoom(selected);
          }
        } else if (mappedRooms.length > 0) {
          setActiveRoom(mappedRooms[0]);
        }
      } catch (err) {
        console.error('Failed to load chat rooms', err);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, [user, queryRoomId]);

  // Handle active room switch
  useEffect(() => {
    if (!activeRoom) return;

    const fetchHistory = async () => {
      setLoadingMessages(true);
      try {
        const history = await messageService.getMessages(activeRoom.id, { page: 1, limit: 50 });
        // The messages are returned ordered by createdAt desc, so we reverse for chat view
        setMessages((history.messages || []).reverse());
      } catch (err) {
        console.error('Failed to fetch message history', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchHistory();

    // Join socket room
    if (socket) {
      socket.emit('room:join', { chatRoomId: activeRoom.id });
    }

    return () => {
      if (socket && activeRoom) {
        socket.emit('room:leave', { chatRoomId: activeRoom.id });
      }
      setIsPeerTyping(false);
    };
  }, [activeRoom, socket]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPeerTyping]);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      // data: { message }
      if (activeRoom && data.message?.chatRoomId === activeRoom.id) {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    const handleTypingUpdate = (data) => {
      // data: { userId, isTyping }
      if (activeRoom && data.userId === activeRoom.peerId) {
        setIsPeerTyping(data.isTyping);
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('typing:update', handleTypingUpdate);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('typing:update', handleTypingUpdate);
    };
  }, [socket, activeRoom]);

  // Send message handler
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom || !socket) return;

    // Send via socket
    socket.emit('message:send', {
      chatRoomId: activeRoom.id,
      content: newMessage.trim(),
    });

    setNewMessage('');
    
    // Stop typing
    socket.emit('typing:stop', { chatRoomId: activeRoom.id });
  };

  // Typing indicators
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !activeRoom) return;

    socket.emit('typing:start', { chatRoomId: activeRoom.id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { chatRoomId: activeRoom.id });
    }, 2000);
  };

  const isPeerOnline = activeRoom && onlineUsers.includes(activeRoom.peerId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 h-[calc(100vh-8rem)]">
      <div className="flex h-full rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm dark:border-darkBorder dark:bg-darkCard">
        
        {/* Left Side: Room list */}
        <div className="w-80 border-r border-gray-100 dark:border-darkBorder flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-100 dark:border-darkBorder font-bold text-base flex items-center gap-2">
            <MessageSquare size={18} className="text-primary-500" /> Active Chats
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingRooms ? (
              <div className="py-8 text-center text-xs text-gray-400">Loading chats...</div>
            ) : rooms.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">No active chats found. Match requests must be accepted first.</div>
            ) : (
              rooms.map((room) => {
                const isActive = activeRoom?.id === room.id;
                const isOnline = onlineUsers.includes(room.peerId);
                return (
                  <div
                    key={room.id}
                    onClick={() => setActiveRoom(room)}
                    className={`flex flex-col gap-0.5 rounded-xl px-4 py-3 cursor-pointer transition select-none ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-400'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{room.peerName}</span>
                      {isOnline && (
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 truncate max-w-full">
                      {room.listingTitle}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat room */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-50/20 dark:bg-darkBg/10">
          {activeRoom ? (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-white dark:bg-darkCard dark:border-darkBorder flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-base leading-none">{activeRoom.peerName}</h2>
                    <span className={`inline-flex items-center gap-1 text-[10px] ${
                      isPeerOnline ? 'text-green-500' : 'text-gray-400'
                    }`}>
                      <span className="h-1 w-1 rounded-full bg-current"></span>
                      {isPeerOnline ? 'online' : 'offline'}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {activeRoom.listingTitle}
                  </span>
                </div>
              </div>

              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingMessages ? (
                  <div className="py-6 text-center text-xs text-gray-400">Loading history...</div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.senderId === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                            isOwn
                              ? 'bg-primary-600 text-white rounded-br-none'
                              : 'bg-white text-gray-800 border border-gray-150 rounded-bl-none dark:bg-darkCard dark:border-darkBorder dark:text-gray-200'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <span className={`block text-[9px] mt-1 text-right ${
                            isOwn ? 'text-primary-200' : 'text-gray-400'
                          }`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                {isPeerTyping && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl px-4 py-3 bg-white border border-gray-150 rounded-bl-none dark:bg-darkCard dark:border-darkBorder flex gap-1 items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce delay-100"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce delay-200"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white dark:bg-darkCard dark:border-darkBorder flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-xs focus:border-primary-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
                />
                <Button type="submit" className="px-5">
                  <Send size={16} />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <MessageSquare size={48} className="text-gray-200 dark:text-gray-700 mb-4" />
              <p className="font-bold text-gray-500 dark:text-gray-400 text-base">Select a conversation</p>
              <p className="text-xs text-gray-400 mt-1">Open a chat from the active chats list to start messaging.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default ChatPage;
